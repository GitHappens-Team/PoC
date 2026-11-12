import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@repo/auth";
import { env } from "@/lib/env";

const PROTECTED = ["/dashboard"];

/**
 * Runs before every page: refreshes the Supabase session (pages can't write
 * cookies, so this is the only place an expired token gets renewed) and
 * bounces signed-out visitors away from protected paths. getClaims only
 * validates the JWT; pages still do the authoritative getUser() check.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerSupabase({
    url: env.NEXT_PUBLIC_SUPABASE_URL(),
    key: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY(),
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        // Fresh tokens on the request, so the page rendering after this sees them...
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        // ...and on the response, so the browser stores them.
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        // Keeps CDNs from caching a response that carries someone's session.
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Nothing between creating the client and this call: it's what triggers the refresh.
  const { data } = await supabase.auth.getClaims();

  const { pathname, search } = request.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!data?.claims && isProtected) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("redirectTo", pathname + search);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Every path except Next's static output and plain asset files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fonts/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)"],
};

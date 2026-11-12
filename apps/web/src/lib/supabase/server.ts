import { createServerSupabase } from "@repo/auth";
import { env } from "../env";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerSupabase({
    url: env.NEXT_PUBLIC_SUPABASE_URL(),
    key: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY(),
    cookies: {
      getAll: async () => {
        return cookieStore.getAll();
      },

      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Safe to ignore: proxy.ts refreshes the session and writes the cookies.
        }
      },
    },
  });
}

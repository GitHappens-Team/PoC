import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/redirect";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeRedirect(request.nextUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    // code + secret cookie → real session (saved as cookies by setAll)
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return redirect(next);
  }

  return redirect("/sign-in?error=Could%20not%20sign%20you%20in");
}

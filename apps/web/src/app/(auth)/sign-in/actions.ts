"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/redirect";

export async function signInWithGoogle(formData: FormData) {
  // Where to go after login; safeRedirect rejects anything off-site.
  const next = safeRedirect(formData.get("redirectTo")?.toString());
  // Our own address, e.g. http://127.0.0.1:3000 (the browser sends it with the form).
  const origin = (await headers()).get("origin");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) redirect(`/sign-in?error=${encodeURIComponent(error.message)}`);
  redirect(data.url); // off to Google
}

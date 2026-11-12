import "server-only";

import { cache } from "react";

import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

/** The current session, read from the database once per request. */
export const getSession = cache(async () => {
  const client = await createClient();

  return (await client.auth.getUser()).data.user;
});

/** Redirects to sign-in (coming back to `returnTo`) when there's no session. */
export async function requireSession(returnTo: string) {
  const session = await getSession();

  if (!session) redirect(`/sign-in?redirectTo=${encodeURIComponent(returnTo)}`);
  return session;
}

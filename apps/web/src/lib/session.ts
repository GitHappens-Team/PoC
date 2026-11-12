import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

/** The current session, read from the database once per request. */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

/** Redirects to sign-in (coming back to `returnTo`) when there's no session. */
export async function requireSession(returnTo: string) {
  const session = await getSession();
  if (!session) redirect(`/sign-in?redirectTo=${encodeURIComponent(returnTo)}`);
  return session;
}

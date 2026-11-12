import { BREACH_CHECK_SKIPPED_HEADER, createBrowserAuthClient } from "@repo/auth/client";

// No `twoFactorRedirect` here: the sign-in form handles `twoFactorRedirect`
// itself, so it can carry `redirectTo` and the enabled methods along with a
// client-side navigation instead of a full page reload.
export const authClient = createBrowserAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
});

export const { signIn, signOut, signUp, useSession } = authClient;

/** Fetch options for calls that set a password: reports whether the server had to skip the breached-password check. */
export const onBreachCheckSkipped = (callback: () => void) => ({
  onSuccess: ({ response }: { response: Response }) => {
    if (response.headers.has(BREACH_CHECK_SKIPPED_HEADER)) callback();
  },
});

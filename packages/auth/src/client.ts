import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "@better-auth/passkey/client";
import { twoFactorClient } from "better-auth/client/plugins";

export { BREACH_CHECK_SKIPPED_HEADER, MIN_PASSWORD_LENGTH } from "./policy";

export interface CreateAuthClientOptions {
  baseURL: string;
  /** Redirect target when the two-factor plugin needs a verification step. */
  twoFactorRedirect?: string;
}

export function createBrowserAuthClient(options: CreateAuthClientOptions) {
  return createAuthClient({
    baseURL: options.baseURL,
    plugins: [
      passkeyClient(),
      twoFactorClient({
        onTwoFactorRedirect: options.twoFactorRedirect
          ? () => {
              window.location.href = options.twoFactorRedirect!;
            }
          : undefined,
      }),
    ],
  });
}

export type BrowserAuthClient = ReturnType<typeof createBrowserAuthClient>;

import type { BetterAuthPlugin } from "better-auth";
import { APIError } from "better-auth/api";
import { isPasswordCompromised } from "better-auth/plugins/haveibeenpwned";
import { getCurrentAuthEndpointContext } from "@better-auth/core/context";
import { BREACH_CHECK_SKIPPED_HEADER } from "./policy";

/** Endpoints that set a new password. Sign-in also hashes (to equalise timing), so it must not be checked. */
const PATHS = new Set(["/sign-up/email", "/change-password", "/reset-password"]);

/**
 * Rejects passwords found in known breaches (k-anonymity range query: only a 5-char
 * SHA-1 prefix leaves the server). Unlike Better Auth's `haveIBeenPwned` plugin it
 * fails open: if the service is down the password is accepted and the response
 * carries BREACH_CHECK_SKIPPED_HEADER, so the UI can point the user to a manual check.
 */
export function breachedPasswordCheck(): BetterAuthPlugin {
  return {
    id: "breached-password-check",
    init(ctx) {
      const hash = ctx.password.hash;
      return {
        context: {
          password: {
            ...ctx.password,
            async hash(password: string) {
              const c = getCurrentAuthEndpointContext();
              if (!c.path || !PATHS.has(c.path)) return hash(password);
              let compromised: boolean;
              try {
                compromised = await isPasswordCompromised(password);
              } catch (error) {
                c.context.logger.warn("Breached-password check unavailable, skipping it", error);
                c.setHeader?.(BREACH_CHECK_SKIPPED_HEADER, "1");
                return hash(password);
              }
              if (compromised) {
                throw APIError.from("BAD_REQUEST", {
                  message: "The password you entered has been compromised. Please choose a different password.",
                  code: "PASSWORD_COMPROMISED",
                });
              }
              return hash(password);
            },
          },
        },
      };
    },
  };
}

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { passkey } from "@better-auth/passkey";
import { twoFactor } from "better-auth/plugins/two-factor";
import { breachedPasswordCheck } from "./breach-check";
import { hashPassword, verifyPassword } from "./password";
import { MIN_PASSWORD_LENGTH } from "./policy";
import type { Db } from "@repo/db";

/**
 * Email-sending is injected by the app so this package stays provider-agnostic
 * (the app wires it to Resend; tests/dev can wire it to a no-op or Mailpit logger).
 */
export interface AuthEmailSender {
  sendVerificationEmail(params: { to: string; name: string; url: string }): Promise<void>;
  sendResetPasswordEmail(params: { to: string; name: string; url: string }): Promise<void>;
  sendTwoFactorOtpEmail(params: { to: string; name: string; otp: string }): Promise<void>;
}

export interface CreateAuthOptions {
  db: Db;
  /** Product name, shown by the browser's passkey prompt. */
  appName: string;
  /** Public URL of the app, e.g. https://app.example.com or http://localhost:3000 */
  baseURL: string;
  /** Long random secret. Required in every environment. */
  secret: string;
  email: AuthEmailSender;
  /** Extra origins allowed to call the auth API (e.g. a future native app). */
  trustedOrigins?: string[];
  /**
   * Reverse proxies / load balancers in front of the app (IPs or CIDRs). The
   * client IP is read from `x-forwarded-for` by stripping these from the
   * right; without it, rate limiting can't tell clients apart in production.
   */
  trustedProxies?: string[];
  /** Header carrying the client IP, when the platform sets a dedicated one (e.g. `x-real-ip`). */
  ipAddressHeader?: string;
}

/**
 * Authentication only. Roles, teams/organisations and permission checks
 * belong in your own schema — Better Auth here only owns identity, sessions,
 * credentials, passkeys and 2FA. Add plugins (magic link, organization, ...)
 * to the list below as the product needs them.
 */
export function createAuth(options: CreateAuthOptions) {
  const { db, appName, baseURL, secret, email, trustedOrigins, trustedProxies, ipAddressHeader } = options;

  return betterAuth({
    baseURL,
    secret,
    trustedOrigins,
    database: drizzleAdapter(db, {
      provider: "pg",
    }),

    // Shared across instances and restarts (the default in-memory store is neither).
    rateLimit: { storage: "database" },

    advanced: {
      ipAddress: {
        ipAddressHeaders: [ipAddressHeader ?? "x-forwarded-for"],
        trustedProxies,
      },
    },

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: MIN_PASSWORD_LENGTH,
      // A reset usually follows a suspected compromise: kill every existing session.
      revokeSessionsOnPasswordReset: true,
      password: { hash: hashPassword, verify: verifyPassword },
      sendResetPassword: async ({ user, url }) => {
        await email.sendResetPasswordEmail({ to: user.email, name: user.name, url });
      },
    },

    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        await email.sendVerificationEmail({ to: user.email, name: user.name, url });
      },
    },

    // Sessions last two weeks and refresh on activity. Shorten `expiresIn` if
    // your users share devices.
    session: {
      expiresIn: 60 * 60 * 24 * 14, // 14 days
      updateAge: 60 * 60 * 24, // refresh once a day of activity
    },

    plugins: [
      breachedPasswordCheck(),
      passkey({
        rpID: new URL(baseURL).hostname,
        rpName: appName,
        origin: new URL(baseURL).origin,
        // A passkey skips the 2FA step, so it must itself prove the user (PIN/biometric).
        authenticatorSelection: { userVerification: "required", residentKey: "preferred" },
      }),
      twoFactor({
        otpOptions: {
          storeOTP: "hashed",
          async sendOTP({ user, otp }) {
            await email.sendTwoFactorOtpEmail({ to: user.email, name: user.name, otp });
          },
        },
      }),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;

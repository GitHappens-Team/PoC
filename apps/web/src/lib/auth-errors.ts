import { MIN_PASSWORD_LENGTH } from "@repo/auth/client";

/**
 * Better Auth returns generic messages plus a stable `code`; map the codes we
 * can hit from these screens to the copy we want to show.
 */
const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Incorrect email or password.",
  INVALID_EMAIL: "Enter a valid email address.",
  INVALID_PASSWORD: "The password is incorrect.",
  EMAIL_NOT_VERIFIED: "You need to confirm your email address before signing in.",
  EMAIL_ALREADY_VERIFIED: "This email address is already confirmed.",
  USER_ALREADY_EXISTS: "An account with this email already exists.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "An account with this email already exists.",
  PASSWORD_TOO_SHORT: `The password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
  PASSWORD_COMPROMISED: "This password has appeared in a public data breach. Choose a different one.",
  PASSWORD_TOO_LONG: "The password is too long (128 characters maximum).",
  INVALID_TOKEN: "This link is invalid or has expired. Request a new one.",
  TOKEN_EXPIRED: "This link has expired. Request a new one.",
  SESSION_EXPIRED: "For security, sign out and sign in again before continuing.",
  SESSION_NOT_FRESH: "For security, sign out and sign in again before continuing.",
  CREDENTIAL_ACCOUNT_NOT_FOUND: "This account has no password set.",

  // two-factor
  INVALID_CODE: "The code is incorrect.",
  INVALID_BACKUP_CODE: "The backup code is not valid.",
  OTP_HAS_EXPIRED: "The code has expired. Request a new one.",
  TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE: "Too many attempts. Request a new code.",
  ACCOUNT_TEMPORARILY_LOCKED: "Too many failed attempts. Try again in a few minutes.",
  INVALID_TWO_FACTOR_COOKIE: "Verification has expired. Sign in again.",
  TOTP_ALREADY_ENABLED: "The authenticator app is already set up.",
  TWO_FACTOR_NOT_ENABLED: "Two-step verification is not enabled.",

  // passkey
  AUTH_CANCELLED: "Passkey sign-in was cancelled.",
  REGISTRATION_CANCELLED: "Passkey registration was cancelled.",
  AUTHENTICATION_FAILED: "We couldn't verify the passkey.",
  PASSKEY_NOT_FOUND: "This passkey is not linked to any account.",
  PREVIOUSLY_REGISTERED: "This passkey is already registered.",
  FAILED_TO_VERIFY_REGISTRATION: "We couldn't register the passkey.",
};

type AuthError = { code?: string; message?: string; status?: number } | null | undefined;

export function authErrorMessage(error: AuthError, fallback = "Something went wrong. Try again.") {
  if (!error) return fallback;
  if (error.code && MESSAGES[error.code]) return MESSAGES[error.code];
  if (error.status === 429) return "Too many attempts. Wait a few seconds and try again.";
  return fallback;
}

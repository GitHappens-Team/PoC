/** Shared by the server config and the client forms, so both validate the same way. */
export const MIN_PASSWORD_LENGTH = 10;

/**
 * Set on a successful sign-up / password change / reset when the breached-password
 * check couldn't run (Have I Been Pwned unreachable), so the UI can suggest a manual check.
 */
export const BREACH_CHECK_SKIPPED_HEADER = "x-password-breach-check-skipped";

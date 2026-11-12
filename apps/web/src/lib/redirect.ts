export const DEFAULT_AFTER_SIGN_IN = "/dashboard";

/**
 * Only same-origin paths are allowed as post-auth destinations, so a crafted
 * `?redirectTo=https://evil.example` (or `//evil.example`) can't bounce users
 * off-site after they sign in.
 */
export function safeRedirect(value: string | string[] | null | undefined, fallback = DEFAULT_AFTER_SIGN_IN) {
  const path = Array.isArray(value) ? value[0] : value;
  if (!path || !path.startsWith("/") || path.startsWith("//")) return fallback;
  // Browsers drop tabs/newlines and treat "\\" as "/" while parsing URLs, so "/\t/evil.com" and
  // "/\\evil.com" both become "//evil.com". Reject them, then confirm the parsed result stays on-origin.
  if (/[\x00-\x1f\\]/.test(path)) return fallback;
  try {
    if (new URL(path, "http://local.invalid").origin !== "http://local.invalid") return fallback;
  } catch {
    return fallback;
  }
  return path;
}

/** Appends `redirectTo` to an auth route, skipping it when it's the default. */
export function withRedirect(route: string, redirectTo: string) {
  return redirectTo === DEFAULT_AFTER_SIGN_IN ? route : `${route}?redirectTo=${encodeURIComponent(redirectTo)}`;
}

import { brand } from "@repo/brand";

// `next build` runs with NODE_ENV=production but without the runtime environment; only enforce at runtime.
const isProd = process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/** Dev-only fallbacks; in production a missing value is a deployment mistake, not something to paper over. */
function requiredInProd(name: string, devDefault: string): string {
  return isProd ? required(name) : (process.env[name] ?? devDefault);
}

function csv(name: string): string[] | undefined {
  const items = process.env[name]?.split(",").map((s) => s.trim()).filter(Boolean);
  return items?.length ? items : undefined;
}

export const env = {
  DATABASE_URL: () => required("DATABASE_URL"),
  AUTH_SECRET: () => {
    const secret = required("AUTH_SECRET");
    if (isProd && (secret.length < 32 || secret.startsWith("dev-only"))) {
      throw new Error("AUTH_SECRET must be a random value of at least 32 characters (openssl rand -base64 32)");
    }
    return secret;
  },
  AUTH_BASE_URL: () => {
    const url = requiredInProd("AUTH_BASE_URL", "http://localhost:3000");
    if (isProd && !url.startsWith("https://")) throw new Error("AUTH_BASE_URL must be https:// in production");
    return url;
  },
  /** Comma-separated IPs/CIDRs of the proxies in front of the app, for rate limiting by client IP. */
  TRUSTED_PROXIES: () => csv("TRUSTED_PROXIES"),
  /** Header the platform uses for the client IP, if not `x-forwarded-for` (e.g. `x-real-ip`). */
  CLIENT_IP_HEADER: () => process.env.CLIENT_IP_HEADER || undefined,
  RESEND_API_KEY: () => requiredInProd("RESEND_API_KEY", "") || undefined,
  EMAIL_FROM: () => requiredInProd("EMAIL_FROM", `${brand.name} <noreply@localhost>`),
  SMTP_HOST: () => process.env.SMTP_HOST ?? "localhost",
  SMTP_PORT: () => Number(process.env.SMTP_PORT ?? 1025),
};

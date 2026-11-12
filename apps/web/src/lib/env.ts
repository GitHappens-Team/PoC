import { brand } from "@repo/brand";

// `next build` runs with NODE_ENV=production but without the runtime environment; only enforce at runtime.
const isProd =
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PHASE !== "phase-production-build";

function required(name: string, v?: string): string {
  const value = v ?? process.env[name];
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
  const items = process.env[name]
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return items?.length ? items : undefined;
}

export const env = {
  DATABASE_URL: () => required("DATABASE_URL"),
  NEXT_PUBLIC_SUPABASE_URL: () =>
    required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: () =>
    required(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
};

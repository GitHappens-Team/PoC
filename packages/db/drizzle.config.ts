import { defineConfig } from "drizzle-kit";

// Share the app's env file so `pnpm db:migrate` and `pnpm dev` hit the same database.
// (pnpm runs this from packages/db.)
try {
  process.loadEnvFile("../../apps/web/.env.local");
} catch {
  // No env file yet (run `pnpm bootstrap`); fall back to the dev default below.
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./migrations",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  },
  schemaFilter: ["public"],
});

// Entrypoint for the `auth` CLI (`pnpm dlx auth@latest generate|migrate`) only.
// It needs a concrete `auth` instance to introspect; src/config.ts exports a
// factory instead, since the app supplies its own db/secret/email at runtime.
// This file builds that instance with throwaway dev values — nothing here
// is imported by the app, and no email is ever actually sent through it.
import { createAuth } from "./src/config";
import { createDb } from "@repo/db";

export const auth = createAuth({
  db: createDb(process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/app"),
  appName: "App",
  baseURL: "http://localhost:3000",
  secret: "cli-schema-generation-only",
  email: {
    async sendVerificationEmail() {},
    async sendResetPasswordEmail() {},
    async sendTwoFactorOtpEmail() {},
  },
});

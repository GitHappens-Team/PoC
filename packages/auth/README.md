# @repo/auth

Better Auth, configured for this app. Owns identity, sessions, credentials,
passkeys and 2FA only — roles, teams and permission checks belong in your own
schema in `packages/db`, not here.

## What's wired up

- Email + password, with required email verification.
- Passkeys (`@better-auth/passkey`).
- TOTP two-factor, with an email OTP fallback.
- 14-day sessions, refreshed daily. Shorten `expiresIn` in `src/config.ts` if
  your users share devices.
- No organization plugin. Add Better Auth's `organization` plugin (or model
  teams in your own schema) when the product needs multi-tenancy, and
  `magicLink` if some users shouldn't need a password.

The product name shown in passkey prompts comes from `packages/brand`.

Email sending is injected (see `AuthEmailSender` in `src/config.ts`) so this
package doesn't hard-depend on Resend — the app wires that in
`apps/web/src/lib/email.ts`.

## Schema

Better Auth's tables — `user`, `session`, `account`, `verification`, plus
`passkey` and `two_factor` from those plugins — live at
[`packages/db/src/schema/auth.ts`](../db/src/schema/auth.ts), generated
by and kept in sync with this package's config via:

```bash
cd packages/auth
pnpm dlx auth@latest generate --config ./cli.config.ts -o ../db/src/schema/auth.ts -y
```

Use the `auth` package (`pnpm dlx auth@latest ...`), not `@better-auth/cli` —
the latter is npm's own deprecated predecessor, no longer maintained.

`src/config.ts` exports a factory (`createAuth`), since the app supplies its
own db/secret/email at runtime — the CLI needs a concrete instance to
introspect instead, which is all `cli.config.ts` is for. It's CLI-only,
never imported by the app, and its dummy secret/email are inert.

Re-run the command above whenever you add or change plugins in
`src/config.ts`, then run `drizzle-kit generate` (from `packages/db`) to
turn the updated schema into a migration.

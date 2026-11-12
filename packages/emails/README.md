# @repo/emails

Branded transactional emails, built with [React Email](https://react.email).
Every template shares one layout (`src/components/layout.tsx`): the
banner, a white card, and the tagline footer — so all mail looks like it came
from the same app as the UI. The name, tagline and colours come from
`packages/brand`; the copy is English, like the app.

| Template | Sent when |
| --- | --- |
| `verify-email` | a user signs up (or asks for a new confirmation link) |
| `reset-password` | a user asks to reset their password |
| `two-factor-code` | a user with 2FA picks "Email" at sign-in |

## Using them

```ts
import { emails } from "@repo/emails";

const { subject, html, text } = await emails.verifyEmail({ baseUrl, name, url });
```

`baseUrl` is the app's public origin: images (`/email/*.png`) and web fonts
(`/fonts/*.woff2`) are served from `apps/web/public`. The app's
`next.config.ts` sends `Access-Control-Allow-Origin: *` on `/fonts/*` so mail
clients can load them. `text` is generated from the HTML; mark anything that
shouldn't appear in it with `data-skip-in-text="true"`.

## Designing

```bash
pnpm --filter @repo/emails dev
```

Opens the preview at http://localhost:3030, using each template's
`PreviewProps`. Images and fonts load from the app, so keep `pnpm dev` running
too. The preview only watches `src/templates` — restart it after editing
`src/components`.

Colours come from `packages/brand/brand.json` (via `src/theme.ts`) and the font
stacks live in `src/theme.ts`; email can't read the app's CSS variables. Stick to inline styles and set
`fontFamily` on every text style: Outlook ignores inherited fonts.

## Brand images

Email clients don't render SVG, so the banner and footer icon are PNGs
generated from `apps/web/assets/logos`:

```bash
pnpm --filter @repo/emails assets
```

`pnpm brand` runs it for you. Re-run it when the logos or brand colours change, and commit the output in
`apps/web/public/email/`.

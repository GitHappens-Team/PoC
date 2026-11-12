import { brand } from "@repo/brand";

// Email can't read CSS variables, so the app's design tokens are mirrored here.
// The colours come from packages/brand/brand.json (regenerate with `pnpm brand`).
const { scale, neutral } = brand.colors;

export const theme = {
  primary: scale,
  surface: neutral.surface,
  card: "#ffffff",
  ink: neutral.ink,
  inkMuted: neutral.inkMuted,
  border: neutral.border,
  error: "#b3402c",
  fontDisplay: "'Baloo 2', 'Nunito', 'Trebuchet MS', Arial, sans-serif",
  fontSans: "Figtree, 'Segoe UI', Helvetica, Arial, sans-serif",
  fontMono: "'SFMono-Regular', Menlo, Consolas, 'Courier New', monospace",
};

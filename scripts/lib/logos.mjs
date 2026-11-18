// Placeholder logos: a generic spark mark plus the product name as live text.
// They exist so a fresh clone looks intentional; replace the SVGs in
// apps/web/assets/logos with your real artwork (then run `pnpm logos`).
// A file is only ever regenerated while it still carries `data-placeholder`,
// so real artwork is never overwritten.
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
export const logosDir = join(root, "apps/web/assets/logos");

const SPARK = "M32 4C35 22 42 29 60 32C42 35 35 42 32 60C29 42 22 35 4 32C22 29 29 22 32 4Z";
const FONT = "font-family=\"'Baloo 2', 'Trebuchet MS', system-ui, sans-serif\" font-weight=\"700\"";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** "Acme Cloud" -> wordmark "Acme", accent "Cloud". A single word is all wordmark. */
export function splitName(name) {
  const words = name.trim().split(/\s+/);
  if (words.length < 2) return [name.trim(), ""];
  return [words.slice(0, -1).join(" "), words[words.length - 1]];
}

const textWidth = (text, size) => Math.ceil(text.length * size * 0.58);

function svg(viewBox, name, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="${esc(name)}" data-placeholder="true"><title>${esc(name)}</title>${body}</svg>\n`;
}

function tspans(name) {
  const [word, accent] = splitName(name);
  return (
    `<tspan fill="var(--logo-wordmark, currentColor)">${esc(word)}</tspan>` +
    // A no-break space: plain spaces at a tspan boundary collapse when rasterised for email.
    (accent ? `<tspan fill="var(--logo-accent, currentColor)">&#160;${esc(accent)}</tspan>` : "")
  );
}

export function placeholderLogos(name, scale) {
  const size = 40;
  const full = [splitName(name)[0], splitName(name)[1]].filter(Boolean).join(" ");
  const w = textWidth(full, size);
  const lockupW = 76 + w;
  const stackedW = Math.max(64, w);
  return {
    "logo-mark.svg": svg("0 0 64 64", name, `<path d="${SPARK}" fill="currentColor"/>`),
    "logo-app-icon.svg": svg(
      "0 0 64 64",
      name,
      `<rect width="64" height="64" rx="14" fill="var(--logo-bg, ${scale[600]})"/>` +
        `<path d="${SPARK}" fill="var(--logo-glyph, ${scale[50]})" transform="translate(14 14) scale(0.56)"/>`,
    ),
    "logo-lockup.svg": svg(
      `0 0 ${lockupW} 64`,
      name,
      `<path d="${SPARK}" fill="currentColor"/><text x="76" y="46" font-size="${size}" ${FONT}>${tspans(name)}</text>`,
    ),
    "logo-stacked.svg": svg(
      `0 0 ${stackedW} 116`,
      name,
      `<path d="${SPARK}" fill="currentColor" transform="translate(${(stackedW - 64) / 2} 0)"/>` +
        `<text x="${stackedW / 2}" y="108" font-size="${size}" text-anchor="middle" ${FONT}>${tspans(name)}</text>`,
    ),
  };
}

/** Writes the placeholder set; skips any file that has been replaced by real artwork. */
export function writePlaceholderLogos(name, scale) {
  mkdirSync(logosDir, { recursive: true });
  const written = [];
  for (const [file, content] of Object.entries(placeholderLogos(name, scale))) {
    const path = join(logosDir, file);
    if (existsSync(path) && !readFileSync(path, "utf8").includes("data-placeholder")) continue;
    writeFileSync(path, content);
    written.push(file);
  }
  return written;
}

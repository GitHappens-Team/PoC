// Rasterizes the brand SVGs into the PNGs the email templates reference.
// Email clients (Gmail, Outlook) don't render SVG, and librsvg doesn't know
// CSS variables, so brand colours are substituted in before rendering.
// Output is committed; re-run with `pnpm --filter @repo/emails assets`
// whenever the logos or brand colours change (`pnpm brand` does it for you).
import { mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import brandData from "@repo/brand/brand.json" with { type: "json" };

const theme = { primary: brandData.colors.scale };
const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const logos = join(root, "apps/web/assets/logos");
const out = join(root, "apps/web/public/email");

/** Fills the logo's currentColor / --logo-* variables with fixed colours. */
async function logo(name, { symbol, wordmark = symbol, accent = symbol, bg, glyph }) {
  return (await readFile(join(logos, `${name}.svg`), "utf8"))
    .replace(/var\(--logo-wordmark,\s*currentColor\)/g, wordmark)
    .replace(/var\(--logo-accent,\s*currentColor\)/g, accent)
    .replace(/var\(--logo-bg,\s*[^)]+\)/g, bg ?? "none")
    .replace(/var\(--logo-glyph,\s*[^)]+\)/g, glyph ?? symbol)
    .replace(/currentColor/g, symbol);
}

/** [width, height] from the SVG's viewBox. */
function sizeOf(svg) {
  const [, , w, h] = svg.match(/viewBox="([^"]+)"/)[1].split(/[\s,]+/).map(Number);
  return [w, h];
}

function innerOf(svg) {
  return svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/<title>[\s\S]*?<\/title>/, "");
}

async function png(svg, file, width) {
  await sharp(Buffer.from(svg), { density: 300 }).resize({ width }).png({ compressionLevel: 9 }).toFile(join(out, file));
  console.log(`  ${file} (${width}px wide)`);
}

/**
 * Header banner: the landing hero in miniature — deep brand colour, faint
 * topographic contours, a ghosted mark bleeding off the edge and the lockup
 * in its dark-theme colours. It's an image, so clients that force dark mode
 * leave it alone.
 */
async function banner(width, height) {
  const ghostSvg = await logo("logo-mark", { symbol: theme.primary[300] });
  const lockupSvg = await logo("logo-lockup", {
    symbol: theme.primary[50],
    wordmark: theme.primary[50],
    accent: theme.primary[200],
  });
  const ghost = innerOf(ghostSvg);
  const lockup = innerOf(lockupSvg);
  const [ghostW, ghostH] = sizeOf(ghostSvg);
  const [lockupW, lockupH] = sizeOf(lockupSvg);
  const ghostScale = 400 / Math.max(ghostW, ghostH);
  const contours = Array.from({ length: 9 }, (_, i) => {
    const o = i - 4;
    return `<path d="M-40 ${150 + o * 26} C 160 ${110 + o * 26 - i * 4}, 340 ${200 + o * 22}, 560 ${150 + o * 24} S 900 ${100 + o * 28}, 1160 ${145 + o * 26}"/>`;
  }).join("");
  const rings = Array.from({ length: 4 }, (_, i) =>
    `<ellipse cx="960" cy="60" rx="${40 + i * 44}" ry="${24 + i * 28}" transform="rotate(-18 960 60)"/>`,
  ).join("");
  // Scale the lockup to ~420px wide (never taller than 110px), centred.
  const scale = Math.min(420 / lockupW, 110 / lockupH);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <radialGradient id="wash" cx="50%" cy="0%" r="95%">
        <stop offset="0" stop-color="${theme.primary[700]}"/>
        <stop offset="1" stop-color="${theme.primary[900]}"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#wash)"/>
    <g fill="none" stroke="${theme.primary[500]}" stroke-opacity=".4" stroke-width="1.5">${contours}${rings}</g>
    <g transform="translate(-60 ${(height - ghostH * ghostScale) / 2}) scale(${ghostScale})" opacity=".1">${ghost}</g>
    <g transform="translate(${(width - lockupW * scale) / 2} ${(height - lockupH * scale) / 2}) scale(${scale})">${lockup}</g>
  </svg>`;
  await png(svg, "banner.png", width);
}

await mkdir(out, { recursive: true });
console.log(`Writing email assets to ${out}`);
// Footer badge, displayed at 32×32.
await png(await logo("logo-app-icon", { symbol: theme.primary[50], bg: theme.primary[600], glyph: theme.primary[50] }), "app-icon.png", 96);
// Displayed at 560×140 (2×).
await banner(1120, 280);

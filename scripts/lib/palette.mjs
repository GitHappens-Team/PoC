// Turns one seed colour into the brand scale and tinted neutrals the design
// tokens need. The lightness ladder is fixed (so contrast pairings such as
// primary = 600 with text on it = 100 keep working); the seed contributes hue
// and saturation only.

export const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000];

// Lightness (%) per step, and saturation relative to step 600.
const LIGHTNESS = [95.9, 89.8, 76.7, 59.6, 43.5, 31.6, 25.1, 20.6, 16.5, 11.2, 3.9, 2.2];
const SATURATION = [0.76, 0.79, 0.63, 0.6, 0.68, 0.95, 1, 1.02, 1.03, 1.08, 1.14, 1.04];

export function isHex(value) {
  return /^#[0-9a-f]{6}$/i.test(value);
}

export function hexToHsl(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (!d) return [0, 0, l * 100];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  return [h < 0 ? h + 360 : h, s * 100, l * 100];
}

export function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return "#" + [f(0), f(8), f(4)].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");
}

export function buildPalette(seed) {
  if (!isHex(seed)) throw new Error(`Expected a colour like #245c45, got "${seed}"`);
  const [h, s] = hexToHsl(seed);
  const sat = Math.max(s, 8); // keep a hint of hue even for near-grey seeds
  const scale = Object.fromEntries(
    STEPS.map((step, i) => [step, hslToHex(h, Math.min(100, sat * SATURATION[i]), LIGHTNESS[i])]),
  );
  // Neutrals borrow the hue, with saturation following the seed's.
  const tint = Math.min(1.2, sat / 45);
  const neutral = {
    surface: hslToHex(h, 40 * tint, 98),
    ink: hslToHex(h, 16 * tint, 12),
    inkMuted: hslToHex(h, 7.5 * tint, 39),
    border: hslToHex(h, 11 * tint, 86),
    inkMutedDark: hslToHex(h, 10 * tint, 66),
  };
  return { seed: seed.toLowerCase(), scale, neutral };
}

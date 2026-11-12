#!/usr/bin/env node
// Re-skin the project after setup.
//
//   pnpm brand --color "#4f46e5"          new colour scale + tokens
//   pnpm brand --name "Acme Cloud"        new name (placeholder logos follow)
//   pnpm brand --tagline "..." --description "..." --lang en
//   pnpm brand                            re-sync tokens/logos/email images with brand.json
//
// Add --no-assets to skip regenerating the logo components and email PNGs.
import { parseArgs } from "node:util";
import { spawnSync } from "node:child_process";
import { applyBrand } from "./lib/brand.mjs";
import { root } from "./lib/logos.mjs";

const { values } = parseArgs({
  options: {
    name: { type: "string" },
    color: { type: "string" },
    tagline: { type: "string" },
    description: { type: "string" },
    lang: { type: "string" },
    "no-assets": { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
});

if (values.help) {
  console.log(readmeHeader());
  process.exit(0);
}

try {
  const { brand, logos } = applyBrand(values);
  console.log(`Brand: ${brand.name} (${brand.colors.seed})`);
  if (logos.length)
    console.log(`Placeholder logos rewritten: ${logos.join(", ")}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

if (!values["no-assets"]) {
  for (const args of [["--filter", "web", "logos"]]) {
    const { status } = spawnSync("pnpm", args, { cwd: root, stdio: "inherit" });
    if (status) process.exit(status);
  }
}

function readmeHeader() {
  return "Usage: pnpm brand [--name <name>] [--color <#hex>] [--tagline <text>] [--description <text>] [--lang <code>] [--no-assets]";
}

#!/usr/bin/env node
// First-run setup: `pnpm bootstrap` (or `node scripts/bootstrap.mjs` before installing).
//
// Asks for a name and brand colour, then brands the project, installs
// dependencies, starts the local Supabase stack (Docker + Supabase CLI), writes
// apps/web/.env.local from its output and applies the database migrations.
//
//   pnpm bootstrap                          interactive
//   pnpm bootstrap -y --name "Acme Cloud"   non-interactive, defaults for the rest
//
// Flags: --name --color --tagline --description --lang
//        --yes/-y  --force (overwrite existing env files)
//        --no-install  --no-supabase  --no-migrate
import { createInterface } from "node:readline/promises";
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { isHex } from "./lib/palette.mjs";
import { applyBrand, readBrand } from "./lib/brand.mjs";
import { root } from "./lib/logos.mjs";

const { values: flags } = parseArgs({
  options: {
    name: { type: "string" },
    color: { type: "string" },
    tagline: { type: "string" },
    description: { type: "string" },
    lang: { type: "string" },
    yes: { type: "boolean", short: "y", default: false },
    force: { type: "boolean", default: false },
    "no-install": { type: "boolean", default: false },
    "no-supabase": { type: "boolean", default: false },
    "no-migrate": { type: "boolean", default: false },
  },
});

const bold = (s) => `\x1b[1m${s}\x1b[22m`;
const dim = (s) => `\x1b[2m${s}\x1b[22m`;
const green = (s) => `\x1b[32m${s}\x1b[39m`;
const yellow = (s) => `\x1b[33m${s}\x1b[39m`;
const step = (s) => console.log(`\n${bold(s)}`);

function run(command, args, options = {}) {
  const { status } = spawnSync(command, args, { cwd: root, stdio: "inherit", ...options });
  return status === 0;
}

const has = (command) => spawnSync(command, ["--version"], { stdio: "ignore" }).status === 0;

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "app";

// ---------------------------------------------------------------- preflight

console.log(`\n${bold("Project bootstrap")}`);

if (Number(process.versions.node.split(".")[0]) < 22) {
  console.error(`Node 22 or newer is required (found ${process.versions.node}). See .nvmrc.`);
  process.exit(1);
}
if (!has("pnpm")) {
  console.error("pnpm is required. Install it with `corepack enable` (or see https://pnpm.io/installation).");
  process.exit(1);
}
let supabaseWanted = !flags["no-supabase"] && has("docker");
if (!flags["no-supabase"] && !supabaseWanted) {
  console.log(yellow("Docker not found: skipping Supabase. Install Docker, then run `pnpm supabase:start` later."));
}

// ------------------------------------------------------------------- answers

const current = readBrand();
const rl = flags.yes ? undefined : createInterface({ input: process.stdin, output: process.stdout });

async function ask(question, fallback, validate = () => undefined) {
  if (!rl) return fallback;
  for (;;) {
    const answer = (await rl.question(`${question} ${dim(`(${fallback})`)} `)).trim() || fallback;
    const problem = validate(answer);
    if (!problem) return answer;
    console.log(yellow(problem));
  }
}

const validColor = (v) => (isHex(v) ? undefined : "Use a 6-digit hex colour, e.g. #4f46e5");

const name = flags.name ?? (await ask("Project name?", current.name));
const color = flags.color ?? (await ask("Brand colour?", current.colors.seed, validColor));
if (flags.color) {
  const problem = validColor(flags.color);
  if (problem) {
    console.error(problem);
    process.exit(1);
  }
}
const tagline = flags.tagline ?? (await ask("Tagline?", current.tagline));
const slug = slugify(name);
rl?.close();

// ------------------------------------------------------------------- brand

step("Branding");
const { logos } = applyBrand({ name, color, tagline, description: flags.description, lang: flags.lang });
console.log(`  ${green("✓")} ${name} · ${color}${logos.length ? " · placeholder logos generated" : ""}`);

const rootPackage = join(root, "package.json");
const pkg = JSON.parse(readFileSync(rootPackage, "utf8"));
pkg.name = slug;
writeFileSync(rootPackage, JSON.stringify(pkg, null, 2) + "\n");

// ------------------------------------------------------------------ install

if (!flags["no-install"]) {
  step("Installing dependencies");
  if (!run("pnpm", ["install"])) process.exit(1);
}

step("Generating logo components");
if (!flags["no-install"] || existsSync(join(root, "node_modules"))) {
  run("pnpm", ["--filter", "web", "logos"]);
} else {
  console.log(dim("  skipped (dependencies not installed); run `pnpm brand` later"));
}

// ---------------------------------------------------------- google secrets

// Must exist before `supabase start`: config.toml reads it via env(...).
step("Google OAuth secrets");
const supabaseEnv = join(root, "supabase/.env");
if (!existsSync(supabaseEnv) || flags.force) {
  copyFileSync(join(root, "supabase/.env.example"), supabaseEnv);
  console.log(`  ${green("✓")} supabase/.env`);
} else {
  console.log(`  ${dim("• supabase/.env exists, keeping it (--force to overwrite)")}`);
}
const googleKeys = ["SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID", "SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET"];
const googleLines = readFileSync(supabaseEnv, "utf8").split("\n");
const googlePlaceholder = googleKeys.some((key) => {
  const line = googleLines.find((l) => l.startsWith(`${key}=`));
  return !line || line.slice(key.length + 1).includes("...");
});

// ----------------------------------------------------------------- supabase

let studioUrl;
let migrated = false;
if (supabaseWanted) {
  step("Starting Supabase");
  if (!run("pnpm", ["exec", "supabase", "start"])) {
    supabaseWanted = false;
    console.log(yellow("Couldn't start Supabase (is Docker running?). Retry with `pnpm supabase:start`."));
  }
}

if (supabaseWanted) {
  step("Environment");
  const status = spawnSync("pnpm", ["exec", "supabase", "status", "-o", "env"], { cwd: root, encoding: "utf8", stdio: "pipe" });
  const out = {};
  for (const line of `${status.stdout ?? ""}\n${status.stderr ?? ""}`.split("\n")) {
    const match = line.trim().match(/^([A-Z0-9_]+)="?(.*?)"?$/);
    if (match) out[match[1]] = match[2];
  }
  studioUrl = out.STUDIO_URL;

  const overrides = {
    NEXT_PUBLIC_SUPABASE_URL: out.API_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: out.PUBLISHABLE_KEY,
    DATABASE_URL: out.DB_URL,
  };
  const missing = Object.keys(overrides).filter((key) => !overrides[key]);

  const appEnv = join(root, "apps/web/.env.local");
  if (existsSync(appEnv) && !flags.force) {
    console.log(`  ${dim("• apps/web/.env.local exists, keeping it (--force to overwrite)")}`);
  } else if (missing.length) {
    console.log(yellow(`Couldn't read ${missing.join(", ")} from \`supabase status -o env\`: apps/web/.env.local not written. Copy apps/web/.env.example by hand.`));
  } else {
    const env = readFileSync(join(root, "apps/web/.env.example"), "utf8")
      .split("\n")
      .map((line) => {
        const key = line.split("=")[0];
        return key in overrides ? `${key}=${overrides[key]}` : line;
      })
      .join("\n");
    writeFileSync(appEnv, env);
    console.log(`  ${green("✓")} apps/web/.env.local`);
  }

  if (!flags["no-migrate"]) {
    step("Applying database migrations");
    migrated = run("pnpm", ["db:migrate"]);
  }
}

// --------------------------------------------------------------------- done

console.log(`\n${green("✓")} ${bold(`${name} is ready.`)}\n`);
console.log("Next:");
if (!supabaseWanted) {
  console.log(`  pnpm supabase:start                 ${dim("start Supabase (needs Docker), then copy its keys into apps/web/.env.local")}`);
}
if (!migrated) console.log(`  pnpm db:migrate                     ${dim("create the tables")}`);
console.log(`  pnpm dev                            ${dim("http://127.0.0.1:3000")}`);
if (studioUrl) console.log(`\nSupabase Studio: ${bold(studioUrl)}`);
if (googlePlaceholder) {
  console.log(
    yellow(
      `\nGoogle login won't work yet: fill ${bold("supabase/.env")} with the OAuth client ID and secret from Google Cloud Console,\n` +
        `then restart Supabase with ${bold("pnpm supabase:stop && pnpm supabase:start")}.`,
    ),
  );
}
console.log(`\nSwap the placeholder logos in ${bold("apps/web/assets/logos")}, then run ${bold("pnpm brand")}.`);
console.log(`Change colours any time with ${bold('pnpm brand --color "#hex"')}.\n`);

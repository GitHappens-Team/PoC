#!/usr/bin/env node
// First-run setup: `pnpm bootstrap` (or `node scripts/bootstrap.mjs` before installing).
//
// Asks for a name and brand colour, then brands the project, writes the env
// files (with a fresh AUTH_SECRET), installs dependencies, starts the local
// Postgres + Mailpit containers and applies the database migrations.
//
//   pnpm bootstrap                          interactive
//   pnpm bootstrap -y --name "Acme Cloud"   non-interactive, defaults for the rest
//
// Flags: --name --color --tagline --description --lang
//        --yes/-y  --force (overwrite existing env files)
//        --no-install  --no-docker  --no-migrate
import { createInterface } from "node:readline/promises";
import { spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
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
    "no-docker": { type: "boolean", default: false },
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

/** First free TCP port at or after `preferred`. */
async function freePort(preferred) {
  for (let port = preferred; port < preferred + 50; port++) {
    const free = await new Promise((resolve) => {
      const server = createServer().once("error", () => resolve(false));
      server.listen(port, () => server.close(() => resolve(true)));
    });
    if (free) return port;
  }
  return preferred;
}

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
const dockerAvailable = !flags["no-docker"] && has("docker");
if (!flags["no-docker"] && !dockerAvailable) {
  console.log(yellow("Docker not found: skipping the local database. Point DATABASE_URL at your own Postgres."));
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

// ---------------------------------------------------------------------- env

step("Environment");
const ports = {
  POSTGRES_PORT: await freePort(5432),
  SMTP_PORT: await freePort(1025),
  MAILPIT_PORT: await freePort(8025),
};
const dbName = slug.replace(/-/g, "_");

const infraEnv = join(root, "infra/dev/.env");
if (!existsSync(infraEnv) || flags.force) {
  writeFileSync(infraEnv, [`COMPOSE_PROJECT_NAME=${slug}-dev`, `POSTGRES_DB=${dbName}`, ...Object.entries(ports).map(([k, v]) => `${k}=${v}`)].join("\n") + "\n");
  console.log(`  ${green("✓")} infra/dev/.env`);
} else {
  console.log(`  ${dim("• infra/dev/.env exists, keeping it (--force to overwrite)")}`);
}

const appEnv = join(root, "apps/web/.env.local");
if (!existsSync(appEnv) || flags.force) {
  const overrides = {
    DATABASE_URL: `postgres://postgres:postgres@localhost:${ports.POSTGRES_PORT}/${dbName}`,
    AUTH_SECRET: randomBytes(32).toString("base64"),
    EMAIL_FROM: `"${name} <noreply@example.com>"`,
    SMTP_PORT: String(ports.SMTP_PORT),
  };
  const env = readFileSync(join(root, ".env.example"), "utf8")
    .split("\n")
    .map((line) => {
      const key = line.split("=")[0];
      return key in overrides ? `${key}=${overrides[key]}` : line;
    })
    .join("\n");
  writeFileSync(appEnv, env);
  console.log(`  ${green("✓")} apps/web/.env.local ${dim("(new AUTH_SECRET generated)")}`);
} else {
  console.log(`  ${dim("• apps/web/.env.local exists, keeping it (--force to overwrite)")}`);
}

// ------------------------------------------------------------------ install

if (!flags["no-install"]) {
  step("Installing dependencies");
  if (!run("pnpm", ["install"])) process.exit(1);
}

step("Generating logo components and email images");
if (!flags["no-install"] || existsSync(join(root, "node_modules"))) {
  run("pnpm", ["--filter", "web", "logos"]);
  run("pnpm", ["--filter", "@repo/emails", "assets"]);
} else {
  console.log(dim("  skipped (dependencies not installed); run `pnpm brand` later"));
}

// ----------------------------------------------------------------- database

let databaseReady = false;
if (dockerAvailable) {
  step("Starting Postgres and Mailpit");
  if (run("docker", ["compose", "-f", "infra/dev/docker-compose.yml", "up", "-d", "--wait"])) {
    if (!flags["no-migrate"]) {
      step("Applying database migrations");
      databaseReady = run("pnpm", ["db:migrate"]);
    }
  } else {
    console.log(yellow("Couldn't start the containers (is Docker running?). Retry with `pnpm infra:up && pnpm db:migrate`."));
  }
}

// --------------------------------------------------------------------- done

console.log(`\n${green("✓")} ${bold(`${name} is ready.`)}\n`);
console.log("Next:");
if (!databaseReady) console.log(`  pnpm infra:up && pnpm db:migrate   ${dim("start Postgres + Mailpit, create the tables")}`);
console.log(`  pnpm dev                            ${dim("http://localhost:3000")}`);
console.log(`\nEmails sent in dev land in Mailpit: ${bold(`http://localhost:${ports.MAILPIT_PORT}`)}`);
console.log(`Swap the placeholder logos in ${bold("apps/web/assets/logos")}, then run ${bold("pnpm brand")}.`);
console.log(`Change colours any time with ${bold('pnpm brand --color "#hex"')}.\n`);

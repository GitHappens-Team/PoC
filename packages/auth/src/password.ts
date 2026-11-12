import { hash, verify } from "@node-rs/argon2";

/**
 * Argon2id at the OWASP-recommended floor (19 MiB, t=2, p=1) bumped to 64 MiB.
 * The PHC string carries its own parameters, so they can be raised later
 * without breaking existing hashes.
 */
const ARGON2 = { algorithm: 2 /* Algorithm.Argon2id (const enum; not importable under isolatedModules) */, memoryCost: 65536, timeCost: 3, parallelism: 1 } as const;

export function hashPassword(password: string) {
  return hash(password.normalize("NFKC"), ARGON2);
}

export function verifyPassword({ hash: stored, password }: { hash: string; password: string }) {
  return verify(stored, password.normalize("NFKC"));
}

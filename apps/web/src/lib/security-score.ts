import "server-only";

import { db } from "./db";

export type SecurityCheck = {
  id: "email" | "passkey" | "two-factor" | "authenticator";
  /** What to do, shown while it's missing. */
  label: string;
  /** Shown once it's in place. */
  doneLabel: string;
  done: boolean;
  points: number;
  /** Why it matters, shown while it's still to do. */
  hint: string;
};

export type SecurityLevel = "low" | "fair" | "good" | "excellent";

export type SecurityScore = {
  score: number;
  level: SecurityLevel;
  checks: SecurityCheck[];
};

/**
 * A nudge, not an audit: points for each protection the user has turned on.
 * Everyone starts at 20 (password + confirmed email, both required to sign in).
 */
export async function getSecurityScore(user: { id: string; twoFactorEnabled?: boolean | null }): Promise<SecurityScore> {
  const [passkey, authenticator] = await Promise.all([
    db.query.passkey.findFirst({ where: (p, { eq }) => eq(p.userId, user.id), columns: { id: true } }),
    db.query.twoFactor.findFirst({ where: (t, { eq }) => eq(t.userId, user.id), columns: { verified: true } }),
  ]);
  const twoFactor = !!user.twoFactorEnabled;

  const checks: SecurityCheck[] = [
    {
      id: "email",
      label: "Confirm your email",
      doneLabel: "Password and confirmed email",
      done: true,
      points: 20,
      hint: "",
    },
    {
      id: "passkey",
      label: "Add a passkey",
      doneLabel: "Passkey on",
      done: !!passkey,
      points: 30,
      hint: "Sign in with your fingerprint or face: no password to guess or steal.",
    },
    {
      id: "two-factor",
      label: "Turn on two-step verification",
      doneLabel: "Two-step verification on",
      done: twoFactor,
      points: 30,
      hint: "Even with your password, nobody gets in without the code.",
    },
    {
      id: "authenticator",
      label: "Use an authenticator app",
      doneLabel: "Authenticator app set up",
      // An abandoned setup leaves an unverified row behind; only a confirmed one counts.
      done: twoFactor && !!authenticator && authenticator.verified !== false,
      points: 20,
      hint: "Safer than email codes, and works without a network connection.",
    },
  ];

  const score = checks.reduce((sum, c) => sum + (c.done ? c.points : 0), 0);
  const level: SecurityLevel = score >= 100 ? "excellent" : score >= 80 ? "good" : score >= 50 ? "fair" : "low";
  return { score, level, checks };
}

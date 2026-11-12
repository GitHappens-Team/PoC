import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { getSecurityScore } from "@/lib/security-score";
import { SecurityScoreCard } from "@/components/brand/security-score";
import { PasskeysSection } from "./passkeys";
import { TwoFactorSection } from "./two-factor";
import { PasswordSection } from "./password";
import { SessionsSection } from "./sessions";

export const metadata: Metadata = {
  title: "Security",
};

export default async function SecurityPage() {
  const { user, session } = await requireSession("/account/security");
  const security = await getSecurityScore(user);
  const hasAuthenticator = security.checks.some((c) => c.id === "authenticator" && c.done);

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-title">Account security</h1>
        <p className="text-body text-ink-muted">
          Signed in as <strong className="text-foreground">{user.email}</strong>.
        </p>
      </div>
      <SecurityScoreCard {...security} />
      <PasskeysSection />
      <TwoFactorSection enabled={!!user.twoFactorEnabled} hasAuthenticator={hasAuthenticator} />
      <PasswordSection />
      <SessionsSection currentSessionId={session.id} />
    </>
  );
}

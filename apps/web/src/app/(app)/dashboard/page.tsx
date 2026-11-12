import type { Metadata } from "next";
import { IconRocket } from "@tabler/icons-react";
import { requireSession } from "@/lib/session";
import { getSecurityScore } from "@/lib/security-score";
import { SecurityScoreNudge } from "@/components/brand/security-score";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const { user } = await requireSession("/dashboard");
  const security = await getSecurityScore(user);
  const firstName = user.name.split(" ")[0];

  return (
    <>
      <h1 className="text-title">Hi, {firstName}!</h1>

      {/* Starting point: replace this card with your product's first screen. */}
      <section className="flex flex-col gap-3 rounded-lg border border-card-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-2">
          <IconRocket className="size-5 text-brand-accent" aria-hidden />
          <h2 className="text-heading">All set</h2>
        </div>
        <p className="text-body text-ink-muted">
          Your account is active. This page requires authentication: start from{" "}
          <code className="text-small">apps/web/src/app/(app)/dashboard/page.tsx</code> to build your product.
        </p>
      </section>

      <SecurityScoreNudge {...security} />
    </>
  );
}

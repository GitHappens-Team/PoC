import Link from "next/link";
import { IconArrowRight, IconCircle, IconCircleCheckFilled, IconShieldHalfFilled } from "@tabler/icons-react";
import type { SecurityCheck, SecurityLevel, SecurityScore } from "@/lib/security-score";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LEVELS: Record<SecurityLevel, { label: string; summary: string }> = {
  low: { label: "Needs work", summary: "Your account is protected by your password only." },
  fair: { label: "Fair", summary: "A good start: one more step and you'll be much safer." },
  good: { label: "Good", summary: "Your account is well protected. Just one finishing touch left." },
  excellent: { label: "Excellent", summary: "Your account is as protected as it gets. Thank you!" },
};

/** Section of /account/security that handles a check (the authenticator lives under two-factor). */
const anchor = (id: SecurityCheck["id"]) => (id === "authenticator" ? "two-factor" : id);

function Meter({ score, level }: Pick<SecurityScore, "score" | "level">) {
  return (
    <div
      role="meter"
      aria-label="Account security"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={score}
      aria-valuetext={`${score} out of 100, ${LEVELS[level].label}`}
      className="h-2 w-full overflow-hidden rounded-full bg-secondary"
    >
      <div
        className={cn("h-full rounded-full transition-[width]", level === "low" ? "bg-warning" : "bg-primary")}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

function Header({ score, level }: Pick<SecurityScore, "score" | "level">) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex items-center gap-2">
        <IconShieldHalfFilled className={cn("size-5", level === "low" ? "text-warning" : "text-brand-accent")} aria-hidden />
        <h2 className="text-heading">Security: {LEVELS[level].label}</h2>
      </div>
      <p className="text-small text-ink-muted" aria-hidden>
        <span className="text-heading text-foreground">{score}</span>/100
      </p>
    </div>
  );
}

/** Dashboard nudge: score plus the single most useful next step. */
export function SecurityScoreNudge({ score, level, checks }: SecurityScore) {
  const next = checks.find((c) => !c.done);
  if (!next) return null;

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-card-border bg-card p-6 shadow-card">
      <Header score={score} level={level} />
      <Meter score={score} level={level} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-body text-ink-muted">
          <span className="font-medium text-foreground">Next step: {next.label.charAt(0).toLowerCase() + next.label.slice(1)}</span>{" "}
          <span className="text-brand-accent">(+{next.points})</span>. {next.hint}
        </p>
        <Button asChild variant="outline" className="shrink-0 self-start sm:self-auto">
          <Link href={`/account/security#${anchor(next.id)}`}>
            Improve
            <IconArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

/** Security page summary: score and the full checklist, linking to each section. */
export function SecurityScoreCard({ score, level, checks }: SecurityScore) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-card-border bg-card p-6 shadow-card">
      <Header score={score} level={level} />
      <Meter score={score} level={level} />
      <p className="text-body text-ink-muted">{LEVELS[level].summary}</p>
      <ul className="flex flex-col gap-2">
        {checks.map((check) => (
          <li key={check.id} className="flex items-start gap-2 text-sm">
            {check.done ? (
              <IconCircleCheckFilled className="mt-px size-5 shrink-0 text-brand-accent" aria-label="Done" />
            ) : (
              <IconCircle className="mt-px size-5 shrink-0 text-ink-muted" aria-label="To do" />
            )}
            {check.done ? (
              <span className="text-ink-muted">{check.doneLabel}</span>
            ) : (
              <span className="flex flex-col">
                <a href={`#${anchor(check.id)}`} className="font-medium text-foreground underline-offset-4 hover:underline">
                  {check.label} <span className="font-normal text-brand-accent">+{check.points}</span>
                </a>
                <span className="text-small text-ink-muted">{check.hint}</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

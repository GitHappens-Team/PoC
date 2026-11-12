"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";

export function Section({
  id,
  title,
  description,
  aside,
  children,
}: {
  id?: string;
  title: string;
  description: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="flex scroll-mt-6 flex-col gap-5 rounded-lg border border-card-border bg-card p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex max-w-xl flex-col gap-1">
          <h2 className="text-heading">{title}</h2>
          <p className="text-body text-ink-muted">{description}</p>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function StatusBadge({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <span
      className={
        on
          ? "rounded-full bg-brand-100 px-2.5 py-0.5 text-label font-medium text-brand-700 dark:bg-brand-800 dark:text-brand-100"
          : "rounded-full border border-border px-2.5 py-0.5 text-label text-ink-muted"
      }
    >
      {children}
    </span>
  );
}

/** Asks for the current password before a sensitive change (2FA on/off, backup codes). */
export function ConfirmPassword({
  label,
  submitLabel,
  onSubmit,
  onCancel,
  children,
}: {
  label: string;
  submitLabel: string;
  onSubmit: (password: string, form: FormData) => Promise<void>;
  onCancel: () => void;
  children?: React.ReactNode;
}) {
  const [pending, setPending] = useState(false);

  async function handle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    await onSubmit(String(form.get("password") ?? ""), form);
    setPending(false);
  }

  return (
    <form onSubmit={handle} className="flex flex-col gap-4 rounded-md border border-border bg-secondary/50 p-4">
      {children}
      <Field id="confirm-password" label={label}>
        <PasswordInput id="confirm-password" name="password" autoComplete="current-password" autoFocus required />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Please wait…" : submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

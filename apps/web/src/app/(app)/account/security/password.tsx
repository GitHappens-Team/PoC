"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MIN_PASSWORD_LENGTH } from "@repo/auth/client";
import { authClient, onBreachCheckSkipped } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { BreachCheckNotice } from "@/components/breach-check-notice";
import { Section } from "./section";

export function PasswordSection() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [breachCheckSkipped, setBreachCheckSkipped] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const currentPassword = String(form.get("currentPassword") ?? "");
    const newPassword = String(form.get("newPassword") ?? "");
    const revokeOtherSessions = form.get("revokeOtherSessions") === "on";

    setError(undefined);
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`The new password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }

    setPending(true);
    setBreachCheckSkipped(false);
    const { error } = await authClient.changePassword(
      { currentPassword, newPassword, revokeOtherSessions },
      onBreachCheckSkipped(() => setBreachCheckSkipped(true)),
    );
    setPending(false);
    if (error) {
      setError(
        error.code === "INVALID_PASSWORD" ? "The current password is incorrect." : authErrorMessage(error),
      );
      return;
    }
    formEl.reset();
    setOpen(false);
    // Revoking other sessions also rotates this one; refresh so the sessions list sees the new id.
    if (revokeOtherSessions) router.refresh();
    setNotice(
      revokeOtherSessions ? "Password updated. Your other devices have been signed out." : "Password updated.",
    );
  }

  return (
    <Section
      title="Password"
      description="Use a long password that differs from the ones you use on other sites."
      aside={
        !open && (
          <Button
            variant="outline"
            onClick={() => {
              setNotice(undefined);
              setOpen(true);
            }}
          >
            Change password
          </Button>
        )
      }
    >
      {notice && <Alert tone="success">{notice}</Alert>}
      {notice && breachCheckSkipped && <BreachCheckNotice />}
      {open && (
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4 rounded-md border border-border bg-secondary/50 p-4">
          {error && <Alert>{error}</Alert>}
          <Field id="current-password" label="Current password">
            <PasswordInput id="current-password" name="currentPassword" autoComplete="current-password" autoFocus required />
          </Field>
          <Field id="new-password" label="New password" hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}>
            <PasswordInput id="new-password" name="newPassword" autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} required />
          </Field>
          <label className="flex items-center gap-2 text-small">
            <input type="checkbox" name="revokeOtherSessions" defaultChecked className="size-4 accent-primary" />
            Sign out other devices
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Update password"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </Section>
  );
}

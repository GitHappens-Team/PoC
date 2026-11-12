"use client";

import { useState } from "react";
import Link from "next/link";
import { IconCircleCheck, IconKey } from "@tabler/icons-react";
import { MIN_PASSWORD_LENGTH } from "@repo/auth/client";
import { authClient, onBreachCheckSkipped } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { BreachCheckNotice } from "@/components/breach-check-notice";
import { AuthHeader } from "../auth-header";

export function ResetPasswordForm({ token }: { token: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldError, setFieldError] = useState<string>();
  const [done, setDone] = useState(false);
  const [breachCheckSkipped, setBreachCheckSkipped] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const newPassword = String(new FormData(event.currentTarget).get("password") ?? "");
    setError(undefined);
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setFieldError(`The password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }
    setFieldError(undefined);

    setPending(true);
    const { error } = await authClient.resetPassword(
      { newPassword, token },
      onBreachCheckSkipped(() => setBreachCheckSkipped(true)),
    );
    setPending(false);
    if (!error) setDone(true);
    // Password problems belong on the field; the alert suggests a new link, which only helps for token errors.
    else if (error.code?.startsWith("PASSWORD_")) setFieldError(authErrorMessage(error));
    else setError(authErrorMessage(error));
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <IconCircleCheck className="size-10 text-brand-accent" aria-hidden />
        <AuthHeader title="Password updated">You can now sign in with your new password.</AuthHeader>
        <Button size="lg" asChild className="w-full">
          <Link href="/sign-in">Sign in</Link>
        </Button>
        {breachCheckSkipped && <BreachCheckNotice />}
      </div>
    );
  }

  return (
    <>
      <AuthHeader title="Choose a new password" />
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        {error && (
          <Alert>
            {error}{" "}
            <Link href="/forgot-password" className="font-medium underline underline-offset-4">
              Request a new link
            </Link>
          </Alert>
        )}
        <Field id="password" label="New password" error={fieldError} hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            autoFocus
            required
            {...(fieldError ? { "aria-invalid": true, "aria-describedby": "password-error" } : {})}
          />
        </Field>
        <Button type="submit" size="lg" disabled={pending}>
          <IconKey data-icon="inline-start" />
          {pending ? "Saving…" : "Save password"}
        </Button>
      </form>
    </>
  );
}

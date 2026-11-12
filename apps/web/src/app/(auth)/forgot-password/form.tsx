"use client";

import { useState } from "react";
import { IconMailCheck, IconSend } from "@tabler/icons-react";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthHeader } from "../auth-header";

export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [sentTo, setSentTo] = useState<string>();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setError(undefined);
    setPending(true);
    const { error } = await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
    setPending(false);
    if (error) setError(authErrorMessage(error));
    else setSentTo(email);
  }

  if (sentTo) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <IconMailCheck className="size-10 text-brand-accent" aria-hidden />
        {/* Same message whether or not the account exists, so this can't be used to probe emails. */}
        <AuthHeader title="Check your email">
          If an account exists for <strong className="text-foreground">{sentTo}</strong>, you will shortly receive a
          link to reset your password.
        </AuthHeader>
      </div>
    );
  }

  return (
    <>
      <AuthHeader title="Forgot your password?">
        Enter your account email and we&apos;ll send you a link to choose a new one.
      </AuthHeader>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        {error && <Alert>{error}</Alert>}
        <Field id="email" label="Email">
          <Input id="email" name="email" type="email" autoComplete="email" autoFocus required />
        </Field>
        <Button type="submit" size="lg" disabled={pending}>
          <IconSend data-icon="inline-start" />
          {pending ? "Sending…" : "Send the link"}
        </Button>
      </form>
    </>
  );
}

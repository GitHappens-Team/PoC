"use client";

import { useState } from "react";
import { IconMailCheck, IconUserPlus } from "@tabler/icons-react";
import { MIN_PASSWORD_LENGTH } from "@repo/auth/client";
import { authClient, onBreachCheckSkipped } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { BreachCheckNotice } from "@/components/breach-check-notice";
import { AuthHeader } from "../auth-header";
import { ResendVerification, VERIFY_EMAIL_CALLBACK } from "../resend-verification";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type Errors = Partial<Record<"name" | "email" | "password", string>>;

export function SignUpForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [errors, setErrors] = useState<Errors>({});
  const [sentTo, setSentTo] = useState<string>();
  const [breachCheckSkipped, setBreachCheckSkipped] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").replace(/\s+/g, " ").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    const next: Errors = {};
    if (!name) next.name = "Enter your full name.";
    if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address.";
    if (password.length < MIN_PASSWORD_LENGTH) next.password = `The password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
    setErrors(next);
    setError(undefined);
    if (Object.keys(next).length > 0) return;

    setPending(true);
    const { error } = await authClient.signUp.email(
      { name, email, password, callbackURL: VERIFY_EMAIL_CALLBACK },
      onBreachCheckSkipped(() => setBreachCheckSkipped(true)),
    );
    setPending(false);
    if (error) {
      if (error.code === "PASSWORD_TOO_SHORT" || error.code === "PASSWORD_TOO_LONG" || error.code === "PASSWORD_COMPROMISED") {
        setErrors({ password: authErrorMessage(error) });
      } else if (error.code?.startsWith("USER_ALREADY_EXISTS")) {
        setErrors({ email: authErrorMessage(error) });
      } else {
        setError(authErrorMessage(error));
      }
      return;
    }
    setSentTo(email);
  }

  if (sentTo) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <IconMailCheck className="size-10 text-brand-accent" aria-hidden />
        <AuthHeader title="Check your email">
          We sent a confirmation link to <strong className="text-foreground">{sentTo}</strong>. Open it to
          activate your account.
        </AuthHeader>
        <ResendVerification email={sentTo} />
        {breachCheckSkipped && <BreachCheckNotice />}
      </div>
    );
  }

  const invalid = (key: keyof Errors) =>
    errors[key] ? { "aria-invalid": true, "aria-describedby": `${key}-error` } : {};

  return (
    <>
      <AuthHeader title="Create your account">
        Sign up to get started.
      </AuthHeader>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        {error && <Alert>{error}</Alert>}
        <Field id="name" label="Full name" error={errors.name}>
          <Input id="name" name="name" autoComplete="name" autoFocus required {...invalid("name")} />
        </Field>
        <Field id="email" label="Email" error={errors.email}>
          <Input id="email" name="email" type="email" autoComplete="email" required {...invalid("email")} />
        </Field>
        <Field id="password" label="Password" error={errors.password} hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
            {...invalid("password")}
          />
        </Field>
        <Button type="submit" size="lg" disabled={pending}>
          <IconUserPlus data-icon="inline-start" />
          {pending ? "Signing up…" : "Sign up"}
        </Button>
      </form>
    </>
  );
}

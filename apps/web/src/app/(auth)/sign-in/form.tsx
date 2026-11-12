"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconFingerprint, IconLogin } from "@tabler/icons-react";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { linkClass } from "../auth-header";
import { ResendVerification } from "../resend-verification";

export function SignInForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<"password" | "passkey" | null>(null);
  const [error, setError] = useState<string>();
  const [unverifiedEmail, setUnverifiedEmail] = useState<string>();

  function done() {
    router.replace(redirectTo);
    router.refresh();
  }

  // Passkey autofill: browsers that support conditional mediation offer saved
  // passkeys straight from the email field's autocomplete dropdown. The request
  // stays pending in the background; it only resolves if the user picks one.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!(await window.PublicKeyCredential?.isConditionalMediationAvailable?.())) return;
      const { data } = await authClient.signIn.passkey({ autoFill: true });
      if (data && !cancelled) done();
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    setError(undefined);
    setUnverifiedEmail(undefined);
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }

    setPending("password");
    const { data, error } = await authClient.signIn.email({ email, password });
    if (error) {
      setPending(null);
      if (error.code === "EMAIL_NOT_VERIFIED") setUnverifiedEmail(email);
      else setError(authErrorMessage(error));
      return;
    }

    if (data && "twoFactorRedirect" in data && data.twoFactorRedirect) {
      const params = new URLSearchParams({ redirectTo });
      const methods = (data as { twoFactorMethods?: string[] }).twoFactorMethods;
      if (methods?.length) params.set("methods", methods.join(","));
      router.push(`/two-factor?${params}`);
      return;
    }
    done();
  }

  async function signInWithPasskey() {
    setError(undefined);
    setUnverifiedEmail(undefined);
    setPending("passkey");
    const { data, error } = await authClient.signIn.passkey();
    if (data) return done();
    setPending(null);
    if (error) setError(authErrorMessage(error, "We couldn't sign you in with the passkey."));
  }

  return (
    <div className="flex flex-col gap-5">
      {error && <Alert>{error}</Alert>}
      {unverifiedEmail && (
        <Alert tone="info" className="flex flex-col gap-3">
          <p>
            You still need to confirm your email address. Check the inbox of{" "}
            <strong>{unverifiedEmail}</strong> and open the link we sent you.
          </p>
          <ResendVerification email={unverifiedEmail} />
        </Alert>
      )}

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <Field id="email" label="Email">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username webauthn"
            autoFocus
            required
          />
        </Field>
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-2">
            <label htmlFor="password" className="text-sm font-medium leading-none">
              Password
            </label>
            <Link href="/forgot-password" className={`text-small ${linkClass}`}>
              Forgot your password?
            </Link>
          </div>
          <PasswordInput id="password" name="password" autoComplete="current-password" required />
        </div>
        <Button type="submit" size="lg" disabled={pending !== null}>
          <IconLogin data-icon="inline-start" />
          {pending === "password" ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-label text-ink-muted" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button type="button" size="lg" variant="outline" onClick={signInWithPasskey} disabled={pending !== null}>
        <IconFingerprint data-icon="inline-start" />
        {pending === "passkey" ? "Waiting for the passkey…" : "Sign in with a passkey"}
      </Button>
    </div>
  );
}

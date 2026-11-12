"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconDeviceMobile, IconLifebuoy, IconMail, IconShieldCheck } from "@tabler/icons-react";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";
import { cn } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { brand } from "@repo/brand";

export type TwoFactorMethod = "totp" | "otp";
type Mode = TwoFactorMethod | "backup";

const MODES: Record<Mode, { label: string; icon: typeof IconMail }> = {
  totp: { label: "App", icon: IconDeviceMobile },
  otp: { label: "Email", icon: IconMail },
  backup: { label: "Backup", icon: IconLifebuoy },
};

export function TwoFactorForm({ redirectTo, methods }: { redirectTo: string; methods: TwoFactorMethod[] }) {
  const router = useRouter();
  const modes: Mode[] = [...methods, "backup"];
  const [mode, setMode] = useState<Mode>(modes[0]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [otpSent, setOtpSent] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError(undefined);
  }

  async function sendOtp() {
    setError(undefined);
    setPending(true);
    const { error } = await authClient.twoFactor.sendOtp();
    setPending(false);
    if (error) return fail(error);
    setOtpSent(true);
  }

  function fail(error: { code?: string; status?: number }) {
    if (error.code === "INVALID_TWO_FACTOR_COOKIE") setSessionExpired(true);
    setError(authErrorMessage(error));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const code = String(form.get("code") ?? "").replace(/\s+/g, "");
    const trustDevice = form.get("trustDevice") === "on";
    if (!code) {
      setError("Enter the code.");
      return;
    }

    setError(undefined);
    setPending(true);
    const body = { code, trustDevice };
    const { error } =
      mode === "totp"
        ? await authClient.twoFactor.verifyTotp(body)
        : mode === "otp"
          ? await authClient.twoFactor.verifyOtp(body)
          : await authClient.twoFactor.verifyBackupCode(body);
    if (error) {
      setPending(false);
      return fail(error);
    }
    router.replace(redirectTo);
    router.refresh();
  }

  if (sessionExpired) {
    return (
      <div className="flex flex-col gap-4">
        <Alert>Verification has expired: for security you need to enter your email and password again.</Alert>
        <Button size="lg" onClick={() => router.replace("/sign-in")}>
          Sign in again
        </Button>
      </div>
    );
  }

  const needsOtp = mode === "otp" && !otpSent;

  return (
    <div className="flex flex-col gap-5">
      <div role="group" aria-label="Verification method" className="grid auto-cols-fr grid-flow-col gap-1 rounded-lg bg-secondary p-1">
        {modes.map((m) => {
          const { label, icon: Icon } = MODES[m];
          return (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => switchMode(m)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-small font-medium text-ink-muted transition-colors hover:text-foreground",
                mode === m && "bg-card text-foreground shadow-sm",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {label}
            </button>
          );
        })}
      </div>

      {error && <Alert>{error}</Alert>}

      {needsOtp ? (
        <div className="flex flex-col gap-4">
          <p className="text-body text-ink-muted">We&apos;ll send a verification code to your account&apos;s email address.</p>
          <Button size="lg" onClick={sendOtp} disabled={pending}>
            <IconMail data-icon="inline-start" />
            {pending ? "Sending…" : "Send me the code"}
          </Button>
        </div>
      ) : (
        <form key={mode} onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <Field
            id="code"
            label={mode === "backup" ? "Backup code" : "6-digit code"}
            hint={
              mode === "totp"
                ? `Open your authenticator app and enter the code for ${brand.name}.`
                : mode === "otp"
                  ? "Check your email: the code expires in a few minutes."
                  : "One of the codes you saved when you turned on verification. Each code works only once."
            }
          >
            <Input
              id="code"
              name="code"
              autoFocus
              required
              autoComplete={mode === "backup" ? "off" : "one-time-code"}
              inputMode={mode === "backup" ? "text" : "numeric"}
              maxLength={mode === "backup" ? 32 : 6}
              className={cn(mode !== "backup" && "font-mono text-lg tracking-[0.4em]")}
            />
          </Field>
          <label className="flex items-start gap-2 text-small">
            <input type="checkbox" name="trustDevice" className="mt-0.5 size-4 accent-primary" />
            <span>
              Remember this device for 30 days
              <span className="block text-ink-muted">Don&apos;t select this on shared devices.</span>
            </span>
          </label>
          <Button type="submit" size="lg" disabled={pending}>
            <IconShieldCheck data-icon="inline-start" />
            {pending ? "Verifying…" : "Verify"}
          </Button>
          {mode === "otp" && (
            <Button type="button" variant="link" onClick={sendOtp} disabled={pending} className="self-center">
              Send a new code
            </Button>
          )}
        </form>
      )}
    </div>
  );
}

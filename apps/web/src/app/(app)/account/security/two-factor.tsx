"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { IconCopy, IconDownload, IconShieldCheck } from "@tabler/icons-react";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ConfirmPassword, Section, StatusBadge } from "./section";
import { brand } from "@repo/brand";

type Step =
  | { name: "idle" }
  | { name: "enable" }
  | { name: "add-authenticator" }
  | { name: "scan"; totpURI: string; backupCodes: string[] }
  | { name: "backup"; backupCodes: string[] }
  | { name: "regenerate" }
  | { name: "disable" };

export function TwoFactorSection({ enabled, hasAuthenticator }: { enabled: boolean; hasAuthenticator: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>({ name: "idle" });
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();

  function go(next: Step) {
    setError(undefined);
    setNotice(undefined);
    setStep(next);
  }

  async function enable(password: string, form: FormData) {
    setError(undefined);
    const method = form.get("method") === "otp" ? "otp" : "totp";
    const { data, error } = await authClient.twoFactor.enable({ password, method, issuer: brand.name });
    if (error) return setError(authErrorMessage(error));
    if (method === "otp") {
      go({ name: "idle" });
      setNotice("Two-step verification is on: you'll get a code by email each time you sign in.");
      router.refresh();
      return;
    }
    if (data && "totpURI" in data && data.totpURI) {
      go({ name: "scan", totpURI: data.totpURI, backupCodes: data.backupCodes ?? [] });
    }
  }

  async function regenerate(password: string) {
    setError(undefined);
    const { data, error } = await authClient.twoFactor.generateBackupCodes({ password });
    if (error) return setError(authErrorMessage(error));
    go({ name: "backup", backupCodes: data.backupCodes });
  }

  async function disable(password: string) {
    setError(undefined);
    const { error } = await authClient.twoFactor.disable({ password });
    if (error) return setError(authErrorMessage(error));
    go({ name: "idle" });
    setNotice("Two-step verification is off.");
    router.refresh();
  }

  return (
    <Section
      id="two-factor"
      title="Two-step verification"
      description="Besides your password, we'll ask for a code from your authenticator app or by email when you sign in."
      aside={<StatusBadge on={enabled}>{enabled ? "On" : "Off"}</StatusBadge>}
    >
      {error && <Alert>{error}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}

      {step.name === "idle" &&
        (enabled ? (
          <div className="flex flex-wrap gap-2">
            {hasAuthenticator ? (
              <Button variant="outline" onClick={() => go({ name: "regenerate" })}>
                New backup codes
              </Button>
            ) : (
              <Button variant="outline" onClick={() => go({ name: "add-authenticator" })}>
                <IconShieldCheck data-icon="inline-start" />
                Set up an authenticator app
              </Button>
            )}
            <Button variant="destructive" onClick={() => go({ name: "disable" })}>
              Turn off
            </Button>
          </div>
        ) : (
          <Button className="self-start" onClick={() => go({ name: "enable" })}>
            <IconShieldCheck data-icon="inline-start" />
            Turn on two-step verification
          </Button>
        ))}

      {step.name === "enable" && (
        <ConfirmPassword label="Confirm with your password" submitLabel="Continue" onSubmit={enable} onCancel={() => go({ name: "idle" })}>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-sm font-medium">How do you want to receive codes?</legend>
            <label className="flex items-start gap-2 text-sm">
              <input type="radio" name="method" value="totp" defaultChecked className="mt-0.5 size-4 accent-primary" />
              <span>
                Authenticator app <span className="text-ink-muted">(recommended)</span>
                <span className="block text-small text-ink-muted">Google Authenticator, 1Password, Authy…</span>
              </span>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input type="radio" name="method" value="otp" className="mt-0.5 size-4 accent-primary" />
              <span>
                Email
                <span className="block text-small text-ink-muted">We email you a code each time you sign in.</span>
              </span>
            </label>
          </fieldset>
        </ConfirmPassword>
      )}

      {step.name === "add-authenticator" && (
        <ConfirmPassword
          label="Confirm with your password"
          submitLabel="Continue"
          onSubmit={enable}
          onCancel={() => go({ name: "idle" })}
        >
          <p className="text-small text-ink-muted">
            You can still receive codes by email when your phone isn&apos;t at hand.
          </p>
        </ConfirmPassword>
      )}

      {step.name === "scan" && (
        <ScanStep
          totpURI={step.totpURI}
          onVerified={() => {
            go({ name: "backup", backupCodes: step.backupCodes });
            router.refresh();
          }}
          onCancel={() => go({ name: "idle" })}
        />
      )}

      {step.name === "backup" && <BackupCodes codes={step.backupCodes} onDone={() => go({ name: "idle" })} />}

      {step.name === "regenerate" && (
        <ConfirmPassword
          label="Confirm with your password"
          submitLabel="Generate new codes"
          onSubmit={regenerate}
          onCancel={() => go({ name: "idle" })}
        >
          <p className="text-small text-ink-muted">Your current backup codes will stop working.</p>
        </ConfirmPassword>
      )}

      {step.name === "disable" && (
        <ConfirmPassword label="Confirm with your password" submitLabel="Turn off" onSubmit={disable} onCancel={() => go({ name: "idle" })}>
          <p className="text-small text-ink-muted">Your account will be protected by your password only.</p>
        </ConfirmPassword>
      )}
    </Section>
  );
}

function ScanStep({ totpURI, onVerified, onCancel }: { totpURI: string; onVerified: () => void; onCancel: () => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const secret = new URL(totpURI).searchParams.get("secret") ?? "";

  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get("code") ?? "").replace(/\s+/g, "");
    setPending(true);
    const { error } = await authClient.twoFactor.verifyTotp({ code });
    setPending(false);
    if (error) setError(authErrorMessage(error));
    else onVerified();
  }

  return (
    <div className="flex flex-col gap-5 rounded-md border border-border bg-secondary/50 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Always dark-on-white: authenticator apps scan inverted codes unreliably. */}
        <div className="self-center rounded-md bg-white p-3 sm:self-start">
          <QRCode value={totpURI} size={160} aria-label="QR code for your authenticator app" />
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-body">
            <strong>1.</strong> Scan the QR code with your authenticator app.
          </p>
          <p className="text-small text-ink-muted">Can&apos;t scan it? Enter this key manually:</p>
          <code className="break-all rounded-sm bg-card px-2 py-1 font-mono text-small select-all">{secret}</code>
        </div>
      </div>
      <form onSubmit={verify} noValidate className="flex flex-col gap-4">
        <Field id="totp-code" label="2. Enter the 6-digit code shown in the app" error={error}>
          <Input
            id="totp-code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            className="max-w-48 font-mono text-lg tracking-[0.4em]"
            {...(error ? { "aria-invalid": true, "aria-describedby": "totp-code-error" } : {})}
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Verifying…" : "Verify and turn on"}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

function BackupCodes({ codes, onDone }: { codes: string[]; onDone: () => void }) {
  const [copied, setCopied] = useState(false);
  const text = codes.join("\n");

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
  }

  function download() {
    const url = URL.createObjectURL(new Blob([`${brand.name}: backup codes\n\n${text}\n`], { type: "text/plain" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `${brand.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-backup-codes.txt` });
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-4 rounded-md border border-border bg-secondary/50 p-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium">Save your backup codes</h3>
        <p className="text-small text-ink-muted">
          If you lose access to your app or email, you can use one to sign in. Each code works only once and we won&apos;t show them again.
        </p>
      </div>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-1 rounded-md bg-card p-4 font-mono text-sm sm:grid-cols-3">
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={copy}>
          <IconCopy data-icon="inline-start" />
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button variant="outline" onClick={download}>
          <IconDownload data-icon="inline-start" />
          Download
        </Button>
        <Button onClick={onDone}>I saved them</Button>
      </div>
    </div>
  );
}

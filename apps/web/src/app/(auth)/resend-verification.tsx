"use client";

import { useState } from "react";
import { IconMailForward } from "@tabler/icons-react";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";
import { Button } from "@/components/ui/button";

export const VERIFY_EMAIL_CALLBACK = "/verify-email";

export function ResendVerification({ email, variant = "outline" }: { email: string; variant?: "outline" | "link" }) {
  const [status, setStatus] = useState<"idle" | "pending" | "sent" | "error">("idle");
  const [error, setError] = useState<string>();

  async function resend() {
    setStatus("pending");
    const { error } = await authClient.sendVerificationEmail({ email, callbackURL: VERIFY_EMAIL_CALLBACK });
    if (error) {
      setError(authErrorMessage(error));
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <p role="status" className="text-small text-ink-muted">
        We sent a new link to <strong className="text-foreground">{email}</strong>.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant={variant} onClick={resend} disabled={status === "pending"} className="self-start">
        <IconMailForward data-icon="inline-start" />
        {status === "pending" ? "Sending…" : "Resend the link"}
      </Button>
      {error && (
        <p role="alert" className="text-small text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

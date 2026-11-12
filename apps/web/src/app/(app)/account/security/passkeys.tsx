"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconFingerprint, IconPlus, IconTrash } from "@tabler/icons-react";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Section, formatDate } from "./section";

export function PasskeysSection() {
  const router = useRouter();
  const { data: passkeys, isPending, refetch } = authClient.useListPasskeys();
  const [adding, setAdding] = useState(false);
  const [pending, setPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string>();
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();

  async function add(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
    setError(undefined);
    setNotice(undefined);
    setPending(true);
    const { error } = await authClient.passkey.addPasskey({ name: name || undefined });
    setPending(false);
    if (error) {
      setError(authErrorMessage(error, "We couldn't add the passkey."));
      return;
    }
    setAdding(false);
    setNotice("Passkey added. You can now use it to sign in.");
    refetch();
    router.refresh();
  }

  async function remove(id: string) {
    setError(undefined);
    setNotice(undefined);
    setPending(true);
    const { error } = await authClient.passkey.deletePasskey({ id });
    setPending(false);
    setConfirmDelete(undefined);
    if (error) setError(authErrorMessage(error));
    refetch();
    router.refresh();
  }

  return (
    <Section
      id="passkey"
      title="Passkey"
      description="Sign in with your fingerprint, face or device PIN instead of typing a password. Safer and faster."
      aside={
        !adding && (
          <Button variant="outline" onClick={() => setAdding(true)}>
            <IconPlus data-icon="inline-start" />
            Add passkey
          </Button>
        )
      }
    >
      {error && <Alert>{error}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}

      {adding && (
        <form onSubmit={add} className="flex flex-col gap-4 rounded-md border border-border bg-secondary/50 p-4">
          <Field id="passkey-name" label="Passkey name" optional hint="Helps you recognise it, e.g. “Marco’s iPhone”.">
            <Input id="passkey-name" name="name" autoFocus maxLength={60} />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={pending}>
              <IconFingerprint data-icon="inline-start" />
              {pending ? "Waiting for your device…" : "Create passkey"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setAdding(false)} disabled={pending}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {isPending ? (
        <p className="text-small text-ink-muted">Loading…</p>
      ) : !passkeys?.length ? (
        <p className="text-small text-ink-muted">No passkeys registered.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
          {passkeys.map((passkey) => (
            <li key={passkey.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <IconFingerprint className="size-5 shrink-0 text-ink-muted" aria-hidden />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">{passkey.name || "Unnamed passkey"}</span>
                <span className="text-small text-ink-muted">
                  Added on {formatDate(passkey.createdAt)}
                  {passkey.backedUp && " · synced"}
                </span>
              </div>
              {confirmDelete === passkey.id ? (
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={() => remove(passkey.id)} disabled={pending}>
                    Confirm removal
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirmDelete(undefined)} disabled={pending}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${passkey.name || "passkey"}`}
                  onClick={() => setConfirmDelete(passkey.id)}
                >
                  <IconTrash />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { IconDeviceDesktop, IconDeviceMobile } from "@tabler/icons-react";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Section, StatusBadge, formatDate } from "./section";

type SessionRow = { id: string; token: string; userAgent?: string | null; ipAddress?: string | null; updatedAt: Date };

/** Good-enough labels for a list of your own devices; not a general UA parser. */
function describe(userAgent: string | null | undefined) {
  const ua = userAgent ?? "";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /Firefox\//.test(ua)
      ? "Firefox"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Safari\//.test(ua)
          ? "Safari"
          : null;
  const os = /iPhone/.test(ua)
    ? "iPhone"
    : /iPad/.test(ua)
      ? "iPad"
      : /Android/.test(ua)
        ? "Android"
        : /Mac OS X/.test(ua)
          ? "macOS"
          : /Windows/.test(ua)
            ? "Windows"
            : /Linux/.test(ua)
              ? "Linux"
              : null;
  const mobile = /iPhone|iPad|Android|Mobile/.test(ua);
  const label = [browser, os].filter(Boolean).join(" on ") || "Unknown device";
  return { label, mobile };
}

export function SessionsSection({ currentSessionId }: { currentSessionId: string }) {
  const [sessions, setSessions] = useState<SessionRow[]>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    const { data, error } = await authClient.listSessions();
    if (error) setError(authErrorMessage(error));
    else setSessions([...data].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount; state is set after the await
    load();
  }, [load, currentSessionId]);

  async function revoke(token: string) {
    setPending(true);
    const { error } = await authClient.revokeSession({ token });
    setPending(false);
    if (error) setError(authErrorMessage(error));
    load();
  }

  async function revokeOthers() {
    setPending(true);
    const { error } = await authClient.revokeOtherSessions();
    setPending(false);
    if (error) setError(authErrorMessage(error));
    load();
  }

  const others = sessions?.filter((s) => s.id !== currentSessionId) ?? [];

  return (
    <Section
      title="Signed-in devices"
      description="If you used a shared device and don't remember signing out, sign it out from here."
      aside={
        others.length > 0 && (
          <Button variant="outline" onClick={revokeOthers} disabled={pending}>
            Sign out other devices
          </Button>
        )
      }
    >
      {error && <Alert>{error}</Alert>}
      {!sessions ? (
        <p className="text-small text-ink-muted">Loading…</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
          {sessions.map((s) => {
            const { label, mobile } = describe(s.userAgent);
            const Icon = mobile ? IconDeviceMobile : IconDeviceDesktop;
            const current = s.id === currentSessionId;
            return (
              <li key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <Icon className="size-5 shrink-0 text-ink-muted" aria-hidden />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {label}
                    {current && <StatusBadge on>This device</StatusBadge>}
                  </span>
                  <span className="text-small text-ink-muted">
                    Last active {formatDate(s.updatedAt)}
                    {s.ipAddress && !/^[0:.]+$/.test(s.ipAddress) && ` · ${s.ipAddress}`}
                  </span>
                </div>
                {!current && (
                  <Button variant="ghost" onClick={() => revoke(s.token)} disabled={pending}>
                    Sign out
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}

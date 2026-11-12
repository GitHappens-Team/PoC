import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/logos";
import { getSession } from "@/lib/session";
import { SignOutButton } from "./sign-out-button";
import { brand } from "@repo/brand";

/**
 * Signed-in area. proxy.ts already bounces requests without a session cookie
 * (keeping `redirectTo`); this is the real check against the database. Pages
 * repeat it via `requireSession`, since layouts don't re-render on navigation.
 */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/dashboard"
            aria-label={`${brand.name}, dashboard`}
            className="rounded-md"
          >
            <LogoMark
              title=""
              aria-hidden
              className="h-7 w-auto text-brand-accent"
            />
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/account/security"
              className="rounded-md px-2.5 py-1.5 text-sm font-medium text-ink-muted hover:bg-muted hover:text-foreground"
            >
              Security
            </Link>
            <span
              className="hidden max-w-48 truncate px-2 text-small text-ink-muted sm:inline"
              title={session.email}
            >
              {session.email}
            </span>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
        {children}
      </main>
    </div>
  );
}

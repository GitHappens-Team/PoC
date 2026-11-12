import Link from "next/link";
import { brand } from "@repo/brand";
import {
  IconLogin,
  IconMail,
  IconShieldLock,
  IconDatabase,
  IconBrandSupabase,
} from "@tabler/icons-react";
import { LogoLockup, LogoMark } from "@/components/logos";
import { Button } from "@/components/ui/button";
import { Contours } from "@/components/brand/contours";

// Placeholder content: swap the copy and icons for your product's selling points.
const features = [
  {
    icon: IconShieldLock,
    title: "Secure sign-in",
    body: "Google sign in already set up.",
  },
  {
    icon: IconBrandSupabase,
    title: "Easy data",
    body: "Supabase for everything",
  },
];

export default function Home() {
  return (
    <main className="flex flex-col items-stretch">
      <nav className="absolute z-99 top-0 left-0 flex w-full items-center justify-between gap-8 p-4">
        <Link href="/" aria-label={brand.name} className="rounded-md">
          <LogoLockup title="" aria-hidden className="logo-brand h-8 w-auto" />
        </Link>
        <Button variant="outline" asChild>
          <Link href="/sign-in">
            <IconLogin data-icon="inline-start" />
            Sign in
          </Link>
        </Button>
      </nav>

      <section
        id="hero"
        className="relative isolate flex min-h-screen w-full flex-col items-center justify-center gap-6 overflow-hidden border-b border-border px-6 py-16 text-center"
      >
        {/* Wash: one quiet radial inside the brand scale */}
        <div
          aria-hidden
          className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,var(--brand-100),transparent_70%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,var(--brand-900),transparent_70%)]"
        />
        <Contours />
        {/* Oversized, ghosted mark behind the headline */}
        <LogoMark
          aria-hidden
          title=""
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[70vh] w-auto -translate-x-1/2 -translate-y-1/2 text-primary opacity-[0.1]"
        />

        <span className="text-label rounded-full border border-border bg-card px-3 py-1 text-ink-muted">
          {brand.name}
        </span>

        <h1 className="text-display max-w-3xl text-balance sm:text-6xl sm:leading-[1.05]">
          <span className="text-brand-accent">{brand.tagline}</span>
        </h1>

        <p className="text-body max-w-xl text-pretty text-ink-muted sm:text-lg sm:leading-7">
          {brand.description}
        </p>

        <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/sign-in">Get started</Link>
          </Button>
          <Button size="lg" variant="ghost" asChild>
            <Link href="#features">Learn more</Link>
          </Button>
        </div>
      </section>

      <section
        id="features"
        className="mx-auto grid w-full max-w-5xl gap-4 px-6 py-20 sm:grid-cols-3"
      >
        {features.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="flex flex-col gap-3 rounded-lg border border-card-border bg-card p-6 shadow-card"
          >
            <Icon className="size-6 text-brand-accent" aria-hidden />
            <h2 className="text-heading">{title}</h2>
            <p className="text-body text-ink-muted">{body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

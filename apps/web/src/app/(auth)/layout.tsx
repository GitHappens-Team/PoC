import Link from "next/link";
import { LogoMark } from "@/components/logos";
import { Contours } from "@/components/brand/contours";
import { brand } from "@repo/brand";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="relative isolate flex min-h-screen flex-1 flex-col items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,var(--brand-100),transparent_70%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,var(--brand-900),transparent_70%)]"
      />
      <Contours />

      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <Link href="/" aria-label={`${brand.name}, back to home`} className="rounded-md">
          <LogoMark title="" aria-hidden className="h-10 w-auto text-brand-accent" />
        </Link>
        <div className="flex w-full flex-col gap-6 rounded-lg border border-card-border bg-card p-6 shadow-card sm:p-8">
          {children}
        </div>
      </div>
    </main>
  );
}

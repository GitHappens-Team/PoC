import type { Metadata } from "next";
import Link from "next/link";
import { IconCircleCheck, IconMailX } from "@tabler/icons-react";
import { getSession } from "@/lib/session";
import { DEFAULT_AFTER_SIGN_IN } from "@/lib/redirect";
import { Button } from "@/components/ui/button";
import { AuthFooter, AuthHeader, linkClass } from "../auth-header";
import { ResendForm } from "./resend-form";
import { brand } from "@repo/brand";

export const metadata: Metadata = {
  title: "Confirm email",
};

/**
 * Landing page for the link in the verification email: Better Auth verifies
 * the token at /api/auth/verify-email, signs the user in, then redirects here
 * (with `?error=invalid_token|token_expired` if the link was bad).
 */
export default async function VerifyEmailPage({ searchParams }: PageProps<"/verify-email">) {
  const { error } = await searchParams;

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <IconMailX className="size-10 text-destructive" aria-hidden />
        <AuthHeader title="Invalid link">
          {error === "token_expired"
            ? "The confirmation link has expired."
            : "The confirmation link is invalid or has already been used."}{" "}
          Enter your email to get a new one.
        </AuthHeader>
        <ResendForm />
        <AuthFooter>
          Already confirmed?{" "}
          <Link href="/sign-in" className={linkClass}>
            Sign in
          </Link>
        </AuthFooter>
      </div>
    );
  }

  const session = await getSession();
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <IconCircleCheck className="size-10 text-brand-accent" aria-hidden />
      <AuthHeader title="Email confirmed">
        {session ? `Welcome, ${session.user.name}! ` : ""}Your {brand.name} account is active.
      </AuthHeader>
      <Button size="lg" asChild className="w-full">
        <Link href={session ? DEFAULT_AFTER_SIGN_IN : "/sign-in"}>{session ? "Continue" : "Sign in"}</Link>
      </Button>
    </div>
  );
}

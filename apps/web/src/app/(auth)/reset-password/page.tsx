import type { Metadata } from "next";
import Link from "next/link";
import { IconLinkOff } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "../auth-header";
import { ResetPasswordForm } from "./form";

export const metadata: Metadata = {
  title: "New password",
};

/**
 * The reset email links to /api/auth/reset-password/:token, which checks the
 * token and redirects here with `?token=` (or `?error=INVALID_TOKEN`).
 */
export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token, error } = await searchParams;

  if (error || typeof token !== "string" || !token) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <IconLinkOff className="size-10 text-destructive" aria-hidden />
        <AuthHeader title="Invalid link">
          The password reset link is invalid or has expired. Request a new one.
        </AuthHeader>
        <Button size="lg" asChild className="w-full">
          <Link href="/forgot-password">Request a new link</Link>
        </Button>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}

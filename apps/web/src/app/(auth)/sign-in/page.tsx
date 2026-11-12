import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { safeRedirect } from "@/lib/redirect";
import { AuthFooter, AuthHeader, linkClass } from "../auth-header";
import { SignInForm } from "./form";
import { brand } from "@repo/brand";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const redirectTo = safeRedirect((await searchParams).redirectTo);
  if (await getSession()) redirect(redirectTo);

  return (
    <>
      <AuthHeader title="Welcome back">Sign in to your {brand.name} account.</AuthHeader>
      <SignInForm redirectTo={redirectTo} />
      <AuthFooter>
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className={linkClass}>
          Sign up
        </Link>
      </AuthFooter>
    </>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { safeRedirect } from "@/lib/redirect";
import { AuthHeader } from "../auth-header";
import { SignInForm } from "./form";
import { brand } from "@repo/brand";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function SignInPage({
  searchParams,
}: PageProps<"/sign-in">) {
  const sp = await searchParams;
  const redirectTo = safeRedirect(sp.redirectTo);
  if (await getSession()) redirect(redirectTo);

  return (
    <>
      <AuthHeader title="Welcome back">
        Sign in to your {brand.name} account.
      </AuthHeader>
      <SignInForm redirectTo={redirectTo} />
      {sp.error && <Alert>{sp.error}</Alert>}
    </>
  );
}

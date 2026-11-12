import type { Metadata } from "next";
import Link from "next/link";
import { safeRedirect } from "@/lib/redirect";
import { AuthFooter, AuthHeader, linkClass } from "../auth-header";
import { TwoFactorForm, type TwoFactorMethod } from "./form";

export const metadata: Metadata = {
  title: "Two-step verification",
};

export default async function TwoFactorPage({ searchParams }: PageProps<"/two-factor">) {
  const params = await searchParams;
  const redirectTo = safeRedirect(params.redirectTo);
  const requested = String(params.methods ?? "").split(",");
  const methods = (["totp", "otp"] as const).filter((m) => requested.includes(m));

  return (
    <>
      <AuthHeader title="Two-step verification">Confirm it&apos;s really you to finish signing in.</AuthHeader>
      <TwoFactorForm redirectTo={redirectTo} methods={methods.length ? methods : (["totp", "otp"] as TwoFactorMethod[])} />
      <AuthFooter>
        <Link href="/sign-in" className={linkClass}>
          Back to sign in
        </Link>
      </AuthFooter>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { DEFAULT_AFTER_SIGN_IN } from "@/lib/redirect";
import { AuthFooter, linkClass } from "../auth-header";
import { SignUpForm } from "./form";

export const metadata: Metadata = {
  title: "Sign up",
};

export default async function SignUpPage() {
  if (await getSession()) redirect(DEFAULT_AFTER_SIGN_IN);

  return (
    <>
      <SignUpForm />
      <AuthFooter>
        Already have an account?{" "}
        <Link href="/sign-in" className={linkClass}>
          Sign in
        </Link>
      </AuthFooter>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { AuthFooter, linkClass } from "../auth-header";
import { ForgotPasswordForm } from "./form";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <ForgotPasswordForm />
      <AuthFooter>
        Remembered it?{" "}
        <Link href="/sign-in" className={linkClass}>
          Back to sign in
        </Link>
      </AuthFooter>
    </>
  );
}

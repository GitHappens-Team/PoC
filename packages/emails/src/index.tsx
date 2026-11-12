import { render, toPlainText } from "@react-email/render";
import VerifyEmail, { verifyEmailSubject, type VerifyEmailProps } from "./templates/verify-email";
import ResetPassword, { resetPasswordSubject, type ResetPasswordProps } from "./templates/reset-password";
import TwoFactorCode, { twoFactorCodeSubject, type TwoFactorCodeProps } from "./templates/two-factor-code";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

async function build(subject: string, element: React.ReactElement): Promise<RenderedEmail> {
  const html = await render(element);
  return { subject, html, text: toPlainText(html, { selectors: [{ selector: "table[data-text-row]", format: "dataTable" }] }) };
}

/** Every transactional email, rendered to subject + HTML + plain-text alternative. */
export const emails = {
  verifyEmail: (props: VerifyEmailProps) => build(verifyEmailSubject, <VerifyEmail {...props} />),
  resetPassword: (props: ResetPasswordProps) => build(resetPasswordSubject, <ResetPassword {...props} />),
  twoFactorCode: (props: TwoFactorCodeProps) => build(twoFactorCodeSubject(props.otp), <TwoFactorCode {...props} />),
};

export type { VerifyEmailProps, ResetPasswordProps, TwoFactorCodeProps };

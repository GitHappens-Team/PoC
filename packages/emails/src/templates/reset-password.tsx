import { brand } from "@repo/brand";
import { EmailLayout } from "../components/layout";
import { CallToAction, Note, Paragraph, Title, firstName } from "../components/elements";

export interface ResetPasswordProps {
  baseUrl: string;
  url: string;
  name?: string;
}

export const resetPasswordSubject = "Reset your password";

export default function ResetPassword({ baseUrl, url, name }: ResetPasswordProps) {
  const first = firstName(name);
  return (
    <EmailLayout
      baseUrl={baseUrl}
      preview={`Choose a new password for your ${brand.name} account.`}
      reason={`You received this email because a password reset was requested for your ${brand.name} account.`}
    >
      <Title>A new password is on its way</Title>
      <Paragraph>
        {first ? `Hi ${first}, we` : "We"} received a request to reset your account password. Use the button below to
        choose a new one.
      </Paragraph>
      <CallToAction href={url}>Choose a new password</CallToAction>
      <Note>
        The link expires in 1 hour and can be used only once. If you didn't ask for this, ignore this email: your
        current password stays valid.
      </Note>
    </EmailLayout>
  );
}

ResetPassword.PreviewProps = {
  baseUrl: "http://localhost:3000",
  url: "http://localhost:3000/api/auth/reset-password/preview?callbackURL=%2Freset-password",
  name: "Marco Rossi",
} satisfies ResetPasswordProps;

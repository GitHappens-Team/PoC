import { brand } from "@repo/brand";
import { EmailLayout } from "../components/layout";
import { CallToAction, Note, Paragraph, Title, firstName } from "../components/elements";

export interface VerifyEmailProps {
  baseUrl: string;
  url: string;
  name?: string;
}

export const verifyEmailSubject = "Confirm your email address";

export default function VerifyEmail({ baseUrl, url, name }: VerifyEmailProps) {
  const first = firstName(name);
  return (
    <EmailLayout
      baseUrl={baseUrl}
      preview={`One click and your ${brand.name} account is active.`}
      reason={`You received this email because someone signed up to ${brand.name} with this address.`}
    >
      <Title>Welcome aboard{first ? `, ${first}` : ""}!</Title>
      <Paragraph>
        Thanks for signing up to {brand.name}. Confirm your email address to activate your account:
        you'll be able to sign in right after.
      </Paragraph>
      <CallToAction href={url}>Confirm my email</CallToAction>
      <Note>
        The link expires in 1 hour. If you didn't create this account, you can ignore this email: without
        confirmation the account won't be activated.
      </Note>
    </EmailLayout>
  );
}

VerifyEmail.PreviewProps = {
  baseUrl: "http://localhost:3000",
  url: "http://localhost:3000/api/auth/verify-email?token=preview&callbackURL=%2Fverify-email",
  name: "Marco Rossi",
} satisfies VerifyEmailProps;

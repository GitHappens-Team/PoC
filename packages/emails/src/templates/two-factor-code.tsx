import { brand } from "@repo/brand";
import { EmailLayout } from "../components/layout";
import { Code, Note, Paragraph, Title, firstName } from "../components/elements";

export interface TwoFactorCodeProps {
  baseUrl: string;
  otp: string;
  name?: string;
}

export const twoFactorCodeSubject = (otp: string) => `${otp} is your ${brand.name} verification code`;

export default function TwoFactorCode({ baseUrl, otp, name }: TwoFactorCodeProps) {
  const first = firstName(name);
  return (
    <EmailLayout
      baseUrl={baseUrl}
      preview={`Your code is ${otp}. It expires in 3 minutes.`}
      reason={`You received this email because someone is signing in to your ${brand.name} account with two-step verification.`}
    >
      <Title>Your verification code</Title>
      <Paragraph>
        {first ? `Hi ${first}, enter` : "Enter"} this code on the sign-in page to complete two-step verification.
      </Paragraph>
      <Code>{otp}</Code>
      <Paragraph muted>The code expires in 3 minutes. Don't share it with anyone: nobody at {brand.name} will ever ask for it.</Paragraph>
      <Note>
        Not you signing in? Someone knows your password: change it right away from the Security page of your
        account.
      </Note>
    </EmailLayout>
  );
}

TwoFactorCode.PreviewProps = {
  baseUrl: "http://localhost:3000",
  otp: "480977",
  name: "Marco Rossi",
} satisfies TwoFactorCodeProps;

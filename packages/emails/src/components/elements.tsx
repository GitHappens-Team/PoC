import { Button, Heading, Hr, Link, Section, Text } from "react-email";
import { theme } from "../theme";

export function Title({ children }: { children: React.ReactNode }) {
  return (
    <Heading as="h1" style={title}>
      {children}
    </Heading>
  );
}

export function Paragraph({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return <Text style={muted ? { ...paragraph, color: theme.inkMuted } : paragraph}>{children}</Text>;
}

/**
 * Primary call to action. Web links get the raw URL underneath for clients
 * that break buttons; it's skipped in the plain-text part, where the button
 * already prints its URL.
 */
export function CallToAction({
  href,
  children,
  fallback = true,
}: {
  href: string;
  children: React.ReactNode;
  fallback?: boolean;
}) {
  return (
    <>
      <Section style={{ margin: "28px 0" }}>
        <Button href={href} style={button}>
          {children}
        </Button>
      </Section>
      {fallback && (
        <div data-skip-in-text="true">
          <Text style={small}>If the button doesn't work, copy and paste this link into your browser:</Text>
          <Link href={href} style={rawLink}>
            {href}
          </Link>
        </div>
      )}
    </>
  );
}

/** One-time code, large and spaced so it's easy to read off a phone. */
export function Code({ children }: { children: string }) {
  return (
    <Section style={codeBox}>
      <Text style={code}>{children}</Text>
    </Section>
  );
}

/** Quiet aside for expiry times and "wasn't you?" notes. */
export function Note({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Hr style={divider} />
      <Text style={small}>{children}</Text>
    </>
  );
}

export function firstName(name: string | undefined) {
  return name?.trim().split(/\s+/)[0];
}

const title: React.CSSProperties = {
  fontFamily: theme.fontDisplay,
  fontSize: "28px",
  lineHeight: "34px",
  fontWeight: 700,
  color: theme.ink,
  margin: "0 0 16px",
};

const paragraph: React.CSSProperties = {
  fontFamily: theme.fontSans,
  fontSize: "15px",
  lineHeight: "24px",
  color: theme.ink,
  margin: "0 0 14px",
};

const small: React.CSSProperties = {
  fontFamily: theme.fontSans,
  fontSize: "13px",
  lineHeight: "20px",
  color: theme.inkMuted,
  margin: "0 0 6px",
};

const button: React.CSSProperties = {
  backgroundColor: theme.primary[600],
  color: theme.primary[50],
  fontFamily: theme.fontSans,
  fontSize: "16px",
  fontWeight: 600,
  lineHeight: "20px",
  borderRadius: "10px",
  padding: "14px 28px",
  textDecoration: "none",
  display: "inline-block",
};

const rawLink: React.CSSProperties = {
  fontFamily: theme.fontSans,
  fontSize: "13px",
  lineHeight: "20px",
  color: theme.primary[600],
  wordBreak: "break-all",
};

const codeBox: React.CSSProperties = {
  backgroundColor: theme.primary[50],
  border: `1px dashed ${theme.primary[300]}`,
  borderRadius: "10px",
  margin: "24px 0",
  padding: "8px 0",
  textAlign: "center",
};

const code: React.CSSProperties = {
  fontFamily: theme.fontMono,
  fontSize: "34px",
  lineHeight: "44px",
  fontWeight: 700,
  letterSpacing: "10px",
  color: theme.primary[700],
  margin: 0,
  paddingLeft: "10px", // balances the trailing letter-spacing so the code stays centred
};

const divider: React.CSSProperties = { borderColor: theme.border, margin: "28px 0 16px" };

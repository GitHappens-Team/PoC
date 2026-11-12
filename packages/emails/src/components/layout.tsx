import { Body, Container, Head, Html, Img, Link, Preview, Section, Text } from "react-email";
import { brand } from "@repo/brand";
import { theme } from "../theme";

export interface LayoutProps {
  /** Public origin of the app (e.g. https://app.example.com); images and fonts are served from it. */
  baseUrl: string;
  /** Inbox preview line shown next to the subject. */
  preview: string;
  /** Why the recipient got this email, shown in the footer. */
  reason: string;
  children: React.ReactNode;
}

/*
 * Our own variable fonts. Apple Mail and iOS render them; Gmail and Outlook
 * fall back to the system stacks in theme.js, which the layout is tuned for.
 */
const fontFaces = (baseUrl: string) => `
  @font-face { font-family: 'Baloo 2'; font-weight: 400 800; font-style: normal; src: url('${baseUrl}/fonts/Baloo2-Variable.woff2') format('woff2'); }
  @font-face { font-family: 'Figtree'; font-weight: 300 900; font-style: normal; src: url('${baseUrl}/fonts/Figtree-Variable.woff2') format('woff2'); }
  @media only screen and (max-width: 600px) {
    /* Body and Section put className on the outer element but the style on their inner cell. */
    .email-body > table > tbody > tr > td { padding: 16px 8px !important; }
    .email-content > tbody > tr > td { padding: 28px 22px 32px !important; }
  }
`;

export function EmailLayout({ baseUrl, preview, reason, children }: LayoutProps) {
  return (
    <Html lang={brand.lang} dir="ltr">
      <Head>
        {/* The design is light-only; ask clients not to auto-invert it. */}
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
        <style>{fontFaces(baseUrl)}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body className="email-body" style={body}>
        <Container style={container}>
          <Section style={card}>
            <Img
              src={`${baseUrl}/email/banner.png`}
              width="560"
              height="140"
              alt={brand.name}
              style={banner}
            />
            <Section className="email-content" style={content}>
              {children}
            </Section>
          </Section>

          <Section style={footer}>
            <Img src={`${baseUrl}/email/app-icon.png`} width="32" height="32" alt="" style={footerIcon} />
            <Text style={footerTagline}>{brand.tagline}</Text>
            <Text style={footerText}>{reason}</Text>
            <Text style={footerText}>
              <Link href={baseUrl} style={footerLink}>
                {brand.name}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: theme.primary[50],
  fontFamily: theme.fontSans,
  margin: 0,
  padding: "32px 12px",
  WebkitFontSmoothing: "antialiased",
};

const container: React.CSSProperties = { maxWidth: "560px", width: "100%", margin: "0 auto" };

const card: React.CSSProperties = {
  backgroundColor: theme.card,
  border: `1px solid ${theme.border}`,
  borderRadius: "15px",
  overflow: "hidden",
};

const banner: React.CSSProperties = { display: "block", width: "100%", height: "auto", border: 0 };

const content: React.CSSProperties = { padding: "36px 40px 40px" };

const footer: React.CSSProperties = { padding: "28px 24px 8px", textAlign: "center" };

const footerIcon: React.CSSProperties = { display: "block", margin: "0 auto 12px", borderRadius: "8px" };

const footerTagline: React.CSSProperties = {
  fontFamily: theme.fontDisplay,
  fontSize: "15px",
  fontWeight: 600,
  lineHeight: "20px",
  color: theme.primary[700],
  margin: "0 0 8px",
};

const footerText: React.CSSProperties = {
  fontFamily: theme.fontSans,
  fontSize: "12px",
  lineHeight: "18px",
  color: theme.inkMuted,
  margin: "0 0 4px",
};

const footerLink: React.CSSProperties = { color: theme.primary[600], fontWeight: 600, textDecoration: "none" };

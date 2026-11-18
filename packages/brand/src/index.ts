import data from "../brand.json";

/**
 * The one place a project's identity lives: name, copy, colours. The app, the
 * emails and the auth config all read from here. Edit `brand.json` by hand for
 * text, and use `pnpm brand --color "#hex"` to regenerate the colour scale
 * (it also rewrites the tokens in apps/web/src/styles/tokens.css).
 */
export const brand = data as {
  /** Product name, shown in titles. */
  name: string;
  /** Short line under the logo in emails and on the landing page. */
  tagline: string;
  /** Default <meta name="description">. */
  description: string;
  /** BCP 47 language of the UI copy (the <html lang> attribute). */
  lang: string;
  colors: {
    /** Hue/saturation source for the generated scale. */
    seed: string;
    /** The brand scale, 50 (lightest) to 1000 (darkest). Mirrors --brand-* in tokens.css. */
    scale: Record<
      | "50"
      | "100"
      | "200"
      | "300"
      | "400"
      | "500"
      | "600"
      | "700"
      | "800"
      | "900"
      | "950"
      | "1000",
      string
    >;
    /** Tinted neutrals for email, which can't read CSS variables. */
    neutral: {
      surface: string;
      ink: string;
      inkMuted: string;
      border: string;
      inkMutedDark: string;
    };
  };
};

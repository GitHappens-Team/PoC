import { Resend } from "resend";
import type { Transporter } from "nodemailer";
import type { AuthEmailSender } from "@repo/auth";
import { emails, type RenderedEmail } from "@repo/emails";
import { env } from "./env";

/**
 * Sends Better Auth's transactional email, rendered from the branded
 * templates in packages/emails. With RESEND_API_KEY set it goes through
 * Resend; in development (only) it falls back to plain SMTP against Mailpit (part of the
 * dev stack — infra/dev/docker-compose.yml), so local links and codes show
 * up at http://localhost:8025 instead of a real inbox.
 */
export const authEmailSender: AuthEmailSender = {
  async sendVerificationEmail({ to, name, url }) {
    await sendEmail({ to, ...(await emails.verifyEmail({ baseUrl: env.AUTH_BASE_URL(), name, url })) });
  },
  async sendResetPasswordEmail({ to, name, url }) {
    await sendEmail({ to, ...(await emails.resetPassword({ baseUrl: env.AUTH_BASE_URL(), name, url })) });
  },
  async sendTwoFactorOtpEmail({ to, name, otp }) {
    await sendEmail({ to, ...(await emails.twoFactorCode({ baseUrl: env.AUTH_BASE_URL(), name, otp })) });
  },
};

type EmailMessage = RenderedEmail & { to: string; replyTo?: string };

export async function sendEmail(message: EmailMessage) {
  const apiKey = env.RESEND_API_KEY();
  if (apiKey) {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: env.EMAIL_FROM(),
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      replyTo: message.replyTo,
    });
    if (error) throw new Error(`Resend: ${error.message}`);
    return;
  }

  // env.RESEND_API_KEY() is mandatory in production, so this is the dev path;
  // nodemailer is a devDependency and is never loaded in production.
  if (process.env.NODE_ENV === "production") throw new Error("RESEND_API_KEY is required in production");
  const transport = await getDevTransport();
  await transport.sendMail({
    from: env.EMAIL_FROM(),
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
    replyTo: message.replyTo,
  });
}

let devTransport: Transporter | undefined;

async function getDevTransport() {
  const { default: nodemailer } = await import("nodemailer");
  devTransport ??= nodemailer.createTransport({
    host: env.SMTP_HOST(),
    port: env.SMTP_PORT(),
    secure: false,
  });
  return devTransport;
}

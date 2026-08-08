import nodemailer, { type Transporter } from "nodemailer";

/**
 * Отправка писем через внешний SMTP-релей (параметры в .env.local).
 * Всё best-effort: если SMTP не настроен или отправка упала — логируем и
 * возвращаем false, но НЕ роняем основной сценарий (заказ/регистрацию).
 */

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() !== "" ? v.trim() : undefined;
}

export function mailFrom(): string {
  return env("SMTP_FROM") || env("SMTP_USER") || "no-reply@localhost";
}

export function adminEmail(): string | undefined {
  return env("ADMIN_EMAIL") || env("SMTP_USER");
}

export function isMailerConfigured(): boolean {
  return !!(env("SMTP_HOST") && env("SMTP_USER") && env("SMTP_PASS"));
}

let transporter: Transporter | null = null;

function getTransport(): Transporter | null {
  if (!isMailerConfigured()) return null;
  if (transporter) return transporter;

  const port = Number(env("SMTP_PORT") || "465");
  // secure=true для 465 (SSL), false для 587 (STARTTLS) — если не задано явно
  const secureEnv = env("SMTP_SECURE");
  const secure = secureEnv ? secureEnv === "true" : port === 465;

  transporter = nodemailer.createTransport({
    host: env("SMTP_HOST"),
    port,
    secure,
    auth: { user: env("SMTP_USER")!, pass: env("SMTP_PASS")! },
  });
  return transporter;
}

export interface MailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendMail(input: MailInput): Promise<boolean> {
  const tx = getTransport();
  if (!tx) {
    console.warn(
      `[mailer] SMTP не настроен — письмо «${input.subject}» для ${input.to} не отправлено`,
    );
    return false;
  }
  try {
    await tx.sendMail({
      from: mailFrom(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    return true;
  } catch (err) {
    console.error(
      `[mailer] Ошибка отправки «${input.subject}» для ${input.to}:`,
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}

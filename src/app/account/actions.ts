"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  authenticateUser,
  changePassword,
  endSession,
  registerUser,
  requireUser,
  startSession,
  updateProfile,
} from "@/lib/userAuth";
import { sendWelcome } from "@/lib/emails";
import { clientIp, maybeCleanup, rateLimit } from "@/lib/rateLimit";

function isValidEmail(email: string): boolean {
  return /.+@.+\..+/.test(email);
}

/** Honeypot: скрытое поле должно быть пустым; иначе это бот. */
function isBot(formData: FormData): boolean {
  return String(formData.get("website") ?? "").trim() !== "";
}

async function ip(): Promise<string> {
  return clientIp(await headers());
}

export async function registerAction(formData: FormData) {
  if (isBot(formData)) redirect("/");
  maybeCleanup();
  const rl = rateLimit(`register:${await ip()}`, 5, 60 * 60 * 1000);
  if (!rl.ok) {
    redirect(
      "/account/register?error=" +
        encodeURIComponent("Слишком много попыток. Попробуйте позже."),
    );
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    redirect("/account/register?error=" + encodeURIComponent("Заполните все поля"));
  }
  if (!isValidEmail(email)) {
    redirect("/account/register?error=" + encodeURIComponent("Некорректный email"));
  }
  if (password.length < 6) {
    redirect(
      "/account/register?error=" +
        encodeURIComponent("Пароль должен быть не короче 6 символов"),
    );
  }

  let userId: number;
  try {
    userId = registerUser(name, email, password);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Ошибка регистрации";
    redirect("/account/register?error=" + encodeURIComponent(msg));
  }

  await startSession(userId);
  // Приветственное письмо — best-effort, не блокирует регистрацию.
  await sendWelcome(name, email);
  redirect("/account");
}

export async function loginAction(formData: FormData) {
  if (isBot(formData)) redirect("/");
  maybeCleanup();
  const rl = rateLimit(`login:${await ip()}`, 10, 10 * 60 * 1000);
  if (!rl.ok) {
    redirect(
      "/account/login?error=" +
        encodeURIComponent("Слишком много попыток. Попробуйте позже."),
    );
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const user = authenticateUser(email, password);
  if (!user) {
    redirect(
      "/account/login?error=" + encodeURIComponent("Неверный email или пароль"),
    );
  }

  await startSession(user.id);
  redirect("/account");
}

export async function logoutAction() {
  await endSession();
  redirect("/");
}

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!name || !email) {
    redirect(
      "/account/settings?error=" + encodeURIComponent("Заполните имя и email"),
    );
  }
  if (!isValidEmail(email)) {
    redirect(
      "/account/settings?error=" + encodeURIComponent("Некорректный email"),
    );
  }

  try {
    updateProfile(user.id, name, email);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Ошибка сохранения профиля";
    redirect("/account/settings?error=" + encodeURIComponent(msg));
  }
  redirect("/account/settings?ok=profile");
}

export async function changePasswordAction(formData: FormData) {
  const user = await requireUser();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");

  if (next.length < 6) {
    redirect(
      "/account/settings?error=" +
        encodeURIComponent("Новый пароль должен быть не короче 6 символов"),
    );
  }

  try {
    changePassword(user.id, current, next);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Ошибка смены пароля";
    redirect("/account/settings?error=" + encodeURIComponent(msg));
  }
  redirect("/account/settings?ok=password");
}

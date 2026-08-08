"use server";

import { redirect } from "next/navigation";
import {
  authenticateUser,
  changePassword,
  endSession,
  registerUser,
  requireUser,
  startSession,
  updateProfile,
} from "@/lib/userAuth";

function isValidEmail(email: string): boolean {
  return /.+@.+\..+/.test(email);
}

export async function registerAction(formData: FormData) {
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
  redirect("/account");
}

export async function loginAction(formData: FormData) {
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

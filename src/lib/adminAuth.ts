import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash } from "node:crypto";

/**
 * Простая авторизация администратора по паролю (без публичной CMS).
 * Пароль берётся из переменной окружения ADMIN_PASSWORD (задать на сервере
 * в .env.local). Для локальной разработки есть дефолт "admin".
 * В cookie кладётся не сам пароль, а его SHA-256 — сверяем с ожидаемым.
 */

const COOKIE_NAME = "market_admin";

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin";
}

export function expectedToken(): string {
  return createHash("sha256")
    .update(`market-admin:${adminPassword()}`)
    .digest("hex");
}

export async function isAdminAuthed(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return !!token && token === expectedToken();
}

export async function signInAdmin(password: string): Promise<boolean> {
  if (password !== adminPassword()) return false;
  const store = await cookies();
  store.set(COOKIE_NAME, expectedToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
  });
  return true;
}

export async function signOutAdmin(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Для защищённых страниц админки: редиректит на логин, если не авторизован. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthed())) redirect("/admin/login");
}

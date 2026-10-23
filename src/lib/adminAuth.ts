import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Авторизация админки без публичной CMS. Две роли:
 *
 * - owner: полный доступ. Пароль из ADMIN_PASSWORD (на сервере в .env.local,
 *   для локалки дефолт "admin"). Вход по одному паролю, логин не нужен.
 * - demo: демо-аккаунт «владельца» для показа заказчикам. Логин из
 *   DEMO_ADMIN_LOGIN (по умолчанию "demo"), пароль из DEMO_ADMIN_PASSWORD.
 *   Если DEMO_ADMIN_PASSWORD не задан, демо-вход выключен. Демо видит товары
 *   и заказы, может создавать и редактировать товары и менять статусы
 *   заказов, но НЕ может удалять товары и их изображения и не имеет доступа к
 *   настройкам сайта (логотип и т.п.).
 *
 * В cookie кладётся не пароль, а SHA-256 (для demo с префиксом "demo."), его
 * и сверяем. Токен owner не менялся, уже выданные сессии остаются в силе.
 */

const COOKIE_NAME = "market_admin";

export type AdminRole = "owner" | "demo";

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin";
}

function demoLogin(): string {
  return (process.env.DEMO_ADMIN_LOGIN || "demo").trim().toLowerCase();
}

function demoPassword(): string | null {
  return process.env.DEMO_ADMIN_PASSWORD?.trim() || null;
}

function sha256(s: string): Buffer {
  return createHash("sha256").update(s).digest();
}

/** Сравнение строк за постоянное время (через хэши одинаковой длины). */
function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(sha256(a), sha256(b));
}

export function expectedToken(): string {
  return createHash("sha256")
    .update(`market-admin:${adminPassword()}`)
    .digest("hex");
}

function expectedDemoToken(): string | null {
  const pw = demoPassword();
  if (!pw) return null;
  return (
    "demo." +
    createHash("sha256")
      .update(`market-admin-demo:${demoLogin()}:${pw}`)
      .digest("hex")
  );
}

/** Роль текущего посетителя или null, если не авторизован. */
export async function getAdminRole(): Promise<AdminRole | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  if (safeEqual(token, expectedToken())) return "owner";
  const demo = expectedDemoToken();
  if (demo && safeEqual(token, demo)) return "demo";
  return null;
}

export async function isAdminAuthed(): Promise<boolean> {
  return (await getAdminRole()) !== null;
}

/** true только для владельца (не для демо-аккаунта). */
export async function isOwner(): Promise<boolean> {
  return (await getAdminRole()) === "owner";
}

/**
 * Вход. Пустой логин (или "admin") означает основной доступ по паролю
 * ADMIN_PASSWORD; логин демо-аккаунта проверяется по DEMO_ADMIN_*.
 */
export async function signInAdmin(
  password: string,
  login = "",
): Promise<boolean> {
  const l = login.trim().toLowerCase();
  let token: string | null = null;

  if (l === "" || l === "admin") {
    if (safeEqual(password, adminPassword())) token = expectedToken();
  } else if (l === demoLogin()) {
    const dp = demoPassword();
    if (dp && safeEqual(password, dp)) token = expectedDemoToken();
  }
  if (!token) return false;

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
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
export async function requireAdmin(): Promise<AdminRole> {
  const role = await getAdminRole();
  if (!role) redirect("/admin/login");
  return role;
}

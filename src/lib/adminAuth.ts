import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, timingSafeEqual } from "node:crypto";
import { isDemoExpired } from "./demoExpiry";

/**
 * Авторизация админки без публичной CMS. Две роли:
 *
 * - owner: полный доступ. Пароль из ADMIN_PASSWORD, логин из ADMIN_LOGIN
 *   (на сервере в .env.local). Если ADMIN_LOGIN задан, он ОБЯЗАТЕЛЕН: пустой
 *   логин или чужой с паролем владельца не пускает. Если не задан (локальная
 *   разработка), работает прежний вход по одному паролю (логин пустой или
 *   "admin"), дефолтный пароль "admin".
 * - demo: демо-аккаунт «владельца» для показа заказчикам. Логин из
 *   DEMO_ADMIN_LOGIN (по умолчанию "demo"), пароль из DEMO_ADMIN_PASSWORD;
 *   без пароля демо-вход выключен. Срок: DEMO_ADMIN_EXPIRES (YYYY-MM-DD),
 *   включительно до конца дня по Москве, после этого вход и уже выданные
 *   сессии отклоняются на сервере; не задан, значит срок не ограничен.
 *   Демо видит товары и заказы, создаёт и редактирует товары, меняет статусы
 *   заказов, но НЕ удаляет товары и их изображения и не видит настройки сайта.
 *
 * В cookie кладётся не пароль, а SHA-256. Токен владельца при заданном
 * ADMIN_LOGIN зависит и от логина (старые сессии без логина перестают
 * действовать); токен демо имеет префикс "demo.".
 */

const COOKIE_NAME = "market_admin";

export type AdminRole = "owner" | "demo";

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin";
}

/** Обязательный логин владельца (в нижнем регистре) или null, если не задан. */
function adminLogin(): string | null {
  return process.env.ADMIN_LOGIN?.trim().toLowerCase() || null;
}

/** true, если вход владельца требует логин (для формы входа). */
export function adminLoginRequired(): boolean {
  return adminLogin() !== null;
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
  const login = adminLogin();
  const seed = login
    ? `market-admin:${login}:${adminPassword()}`
    : `market-admin:${adminPassword()}`;
  return createHash("sha256").update(seed).digest("hex");
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

/** Демо доступно: пароль задан и срок (если есть) не истёк. */
function demoActive(): boolean {
  return (
    demoPassword() !== null && !isDemoExpired(process.env.DEMO_ADMIN_EXPIRES)
  );
}

/** Роль текущего посетителя или null, если не авторизован. */
export async function getAdminRole(): Promise<AdminRole | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  if (safeEqual(token, expectedToken())) return "owner";
  const demo = expectedDemoToken();
  // срок демо проверяется на каждый запрос, поэтому действует и на уже
  // выданные сессии
  if (demo && demoActive() && safeEqual(token, demo)) return "demo";
  return null;
}

export async function isAdminAuthed(): Promise<boolean> {
  return (await getAdminRole()) !== null;
}

/** true только для владельца (не для демо-аккаунта). */
export async function isOwner(): Promise<boolean> {
  return (await getAdminRole()) === "owner";
}

/** Вход: логин и пароль проверяются по роли, у каждой роли свой логин. */
export async function signInAdmin(
  password: string,
  login = "",
): Promise<boolean> {
  const l = login.trim().toLowerCase();
  const ownerLogin = adminLogin();
  let token: string | null = null;

  // владелец: при заданном ADMIN_LOGIN нужен именно он, иначе прежний режим
  const ownerLoginOk = ownerLogin ? l === ownerLogin : l === "" || l === "admin";
  if (ownerLoginOk) {
    if (safeEqual(password, adminPassword())) token = expectedToken();
  } else if (l === demoLogin() && demoActive()) {
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

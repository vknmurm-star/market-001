import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { getDb } from "./db";
import type { User } from "./types";

/**
 * Простая авторизация покупателя: пароль хэшируется scrypt (соль:хэш),
 * сессия — подписанная HMAC-кука `${userId}.${sig}` (stateless).
 * Секрет — из SESSION_SECRET (задать на сервере), с дев-фолбэком.
 */

const COOKIE_NAME = "market_user";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 дней

function sessionSecret(): string {
  return process.env.SESSION_SECRET || "market-dev-session-secret-change-me";
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const hash = scryptSync(password, Buffer.from(saltHex, "hex"), 64);
  const expected = Buffer.from(hashHex, "hex");
  return hash.length === expected.length && timingSafeEqual(hash, expected);
}

function sign(userId: number): string {
  const sig = createHmac("sha256", sessionSecret())
    .update(String(userId))
    .digest("hex");
  return `${userId}.${sig}`;
}

function verifyCookie(value: string): number | null {
  const dot = value.lastIndexOf(".");
  if (dot < 0) return null;
  const idPart = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  const expected = createHmac("sha256", sessionSecret())
    .update(idPart)
    .digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const id = Number(idPart);
  return Number.isInteger(id) && id > 0 ? id : null;
}

interface UserRow {
  id: number;
  email: string;
  name: string;
  password_hash: string | null;
  created_at: string;
}

function getUserRowByEmail(email: string): UserRow | null {
  const row = getDb()
    .prepare(`SELECT * FROM users WHERE email = ?`)
    .get(email.trim().toLowerCase()) as unknown as UserRow | undefined;
  return row ?? null;
}

function getUserRowById(id: number): UserRow | null {
  const row = getDb()
    .prepare(`SELECT * FROM users WHERE id = ?`)
    .get(id) as unknown as UserRow | undefined;
  return row ?? null;
}

function toUser(r: UserRow): User {
  return { id: r.id, email: r.email, name: r.name, createdAt: r.created_at };
}

/** Регистрация. Бросает Error с сообщением при занятом email. Возвращает id. */
export function registerUser(
  name: string,
  email: string,
  password: string,
): number {
  const db = getDb();
  const normEmail = email.trim().toLowerCase();
  const existing = getUserRowByEmail(normEmail);

  if (existing && existing.password_hash) {
    throw new Error("Пользователь с таким email уже зарегистрирован");
  }

  const hash = hashPassword(password);
  if (existing) {
    // «Гостевой» пользователь (создан при заказе) — привязываем пароль.
    db.prepare(
      `UPDATE users SET name = ?, password_hash = ? WHERE id = ?`,
    ).run(name.trim(), hash, existing.id);
    return existing.id;
  }

  const res = db
    .prepare(`INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)`)
    .run(normEmail, name.trim(), hash);
  return Number(res.lastInsertRowid);
}

/** Проверка логина. Возвращает User или null. */
export function authenticateUser(email: string, password: string): User | null {
  const row = getUserRowByEmail(email);
  if (!row || !row.password_hash) return null;
  if (!verifyPassword(password, row.password_hash)) return null;
  return toUser(row);
}

export async function startSession(userId: number): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, sign(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const id = verifyCookie(raw);
  if (!id) return null;
  const row = getUserRowById(id);
  return row ? toUser(row) : null;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login");
  return user;
}

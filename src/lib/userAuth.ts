import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createHash,
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

/**
 * Обновление профиля (имя + email). Email должен быть свободен. При смене
 * email обновляем и email в прошлых заказах пользователя, чтобы история
 * оставалась привязанной (заказы связаны и по user_id, и по email-строке).
 */
export function updateProfile(
  userId: number,
  name: string,
  email: string,
): User {
  const db = getDb();
  const normEmail = email.trim().toLowerCase();

  const taken = db
    .prepare(`SELECT id FROM users WHERE email = ? AND id != ?`)
    .get(normEmail, userId) as unknown as { id: number } | undefined;
  if (taken) {
    throw new Error("Этот email уже занят другим аккаунтом");
  }

  db.exec("BEGIN");
  try {
    db.prepare(`UPDATE users SET name = ?, email = ? WHERE id = ?`).run(
      name.trim(),
      normEmail,
      userId,
    );
    db.prepare(`UPDATE orders SET email = ? WHERE user_id = ?`).run(
      normEmail,
      userId,
    );
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }

  const row = getUserRowById(userId);
  if (!row) throw new Error("Пользователь не найден");
  return toUser(row);
}

function sha256(v: string): string {
  return createHash("sha256").update(v).digest("hex");
}

/**
 * Создаёт токен сброса пароля для email (если такой зарегистрированный
 * пользователь есть). В БД хранится только хэш токена; сырой токен
 * возвращается для отправки ссылкой. TTL 1 час, single-use. Если
 * пользователя нет или у него нет пароля — возвращает null (наружу всё равно
 * показываем одинаковый ответ, чтобы не раскрывать наличие email).
 */
export function createPasswordReset(email: string): string | null {
  const db = getDb();
  const row = getUserRowByEmail(email);
  if (!row || !row.password_hash) return null;

  const token = randomBytes(32).toString("hex");
  // старые неиспользованные токены этого пользователя гасим
  db.prepare(`UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0`).run(
    row.id,
  );
  db.prepare(
    `INSERT INTO password_resets (user_id, token_hash, expires_at)
     VALUES (?, ?, datetime('now', '+1 hour'))`,
  ).run(row.id, sha256(token));
  return token;
}

/**
 * Погашает токен: если валиден (не использован, не истёк) — ставит новый
 * пароль пользователю и помечает токен использованным. Возвращает email
 * пользователя при успехе (для авто-логина/сообщения) или null.
 */
export function consumePasswordReset(
  token: string,
  newPassword: string,
): string | null {
  const db = getDb();
  const reset = db
    .prepare(
      `SELECT id, user_id FROM password_resets
       WHERE token_hash = ? AND used = 0 AND expires_at > datetime('now')
       ORDER BY id DESC LIMIT 1`,
    )
    .get(sha256(token)) as unknown as { id: number; user_id: number } | undefined;
  if (!reset) return null;

  db.exec("BEGIN");
  try {
    db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(
      hashPassword(newPassword),
      reset.user_id,
    );
    // гасим все токены сброса этого пользователя
    db.prepare(`UPDATE password_resets SET used = 1 WHERE user_id = ?`).run(
      reset.user_id,
    );
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }

  const user = getUserRowById(reset.user_id);
  return user ? user.email : null;
}

/** Смена пароля залогиненного пользователя: проверяем текущий, ставим новый. */
export function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
): void {
  const row = getUserRowById(userId);
  if (!row) throw new Error("Пользователь не найден");
  if (!row.password_hash || !verifyPassword(currentPassword, row.password_hash)) {
    throw new Error("Текущий пароль указан неверно");
  }
  getDb()
    .prepare(`UPDATE users SET password_hash = ? WHERE id = ?`)
    .run(hashPassword(newPassword), userId);
}

/**
 * Простой in-memory rate-limit (sliding window). Подходит для одного
 * инстанса PM2 (fork). Ключ — обычно `${action}:${ip}`.
 */

const hits = new Map<string, number[]>();

export interface RateResult {
  ok: boolean;
  retryAfterSec?: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateResult {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (arr.length >= limit) {
    const retryAfterSec = Math.ceil((arr[0] + windowMs - now) / 1000);
    hits.set(key, arr);
    return { ok: false, retryAfterSec: Math.max(1, retryAfterSec) };
  }

  arr.push(now);
  hits.set(key, arr);
  return { ok: true };
}

/** Извлекает IP клиента из заголовков (за nginx — X-Forwarded-For / X-Real-IP). */
export function clientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}

// Периодическая чистка, чтобы Map не рос бесконечно.
const CLEAN_INTERVAL = 10 * 60 * 1000;
let lastClean = Date.now();
export function maybeCleanup(maxWindowMs = 60 * 60 * 1000) {
  const now = Date.now();
  if (now - lastClean < CLEAN_INTERVAL) return;
  lastClean = now;
  for (const [k, arr] of hits) {
    const kept = arr.filter((t) => now - t < maxWindowMs);
    if (kept.length === 0) hits.delete(k);
    else hits.set(k, kept);
  }
}

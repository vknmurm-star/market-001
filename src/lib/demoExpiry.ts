/**
 * Срок действия демо-аккаунта админки (DEMO_ADMIN_EXPIRES, формат YYYY-MM-DD).
 * Демо работает ВКЛЮЧИТЕЛЬНО до конца указанного дня по Москве (UTC+3, без
 * перехода на летнее время): в 00:00:00 МСК следующего дня вход и уже выданные
 * сессии отклоняются. Если переменная не задана или пуста, срок не ограничен.
 * Если задана, но не в формате YYYY-MM-DD или такой даты нет, срок считается
 * истёкшим (демо закрыто), чтобы опечатка не оставила доступ открытым.
 */

const MSK_OFFSET_MS = 3 * 60 * 60 * 1000;

/** Момент (UTC, мс), с которого демо уже закрыто, или null, если срока нет. */
export function demoExpiryCutoff(raw: string | undefined | null): number | null {
  const v = raw?.trim();
  if (!v) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return -Infinity; // некорректный формат: закрыто
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const probe = new Date(Date.UTC(y, mo - 1, d));
  if (
    probe.getUTCFullYear() !== y ||
    probe.getUTCMonth() !== mo - 1 ||
    probe.getUTCDate() !== d
  ) {
    return -Infinity; // несуществующая дата (например 2026-02-30): закрыто
  }
  // 00:00:00 МСК следующего дня = 21:00:00 UTC указанного дня
  return Date.UTC(y, mo - 1, d + 1) - MSK_OFFSET_MS;
}

export function isDemoExpired(
  raw: string | undefined | null,
  now: number = Date.now(),
): boolean {
  const cutoff = demoExpiryCutoff(raw);
  return cutoff !== null && now >= cutoff;
}

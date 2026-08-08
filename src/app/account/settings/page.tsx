import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/userAuth";
import { changePasswordAction, updateProfileAction } from "../actions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: "Настройки профиля",
  robots: { index: false, follow: false },
};

const inputClass =
  "w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent";

const OK_MESSAGES: Record<string, string> = {
  profile: "Профиль сохранён.",
  password: "Пароль изменён.",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : "";
  const ok = typeof sp.ok === "string" ? OK_MESSAGES[sp.ok] : "";

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Настройки профиля</h1>
        <Link href="/account" className="text-sm text-accent hover:underline">
          ← В кабинет
        </Link>
      </div>

      {ok && (
        <p className="mb-6 rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {ok}
        </p>
      )}
      {error && (
        <p className="mb-6 rounded-2xl bg-accent-soft px-4 py-3 text-sm text-accent-dark">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          action={updateProfileAction}
          className="space-y-4 rounded-2xl border bg-card p-6"
        >
          <h2 className="font-semibold">Личные данные</h2>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Имя</span>
            <input
              name="name"
              required
              defaultValue={user.name}
              className={inputClass}
              autoComplete="name"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Email</span>
            <input
              name="email"
              type="email"
              required
              defaultValue={user.email}
              className={inputClass}
              autoComplete="email"
            />
            <span className="mt-1 block text-xs text-muted">
              При смене email история заказов останется привязанной к аккаунту.
            </span>
          </label>
          <button
            type="submit"
            className="rounded-full bg-accent px-6 py-2.5 font-semibold text-white hover:bg-accent-dark"
          >
            Сохранить профиль
          </button>
        </form>

        <form
          action={changePasswordAction}
          className="space-y-4 rounded-2xl border bg-card p-6"
        >
          <h2 className="font-semibold">Смена пароля</h2>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Текущий пароль</span>
            <input
              name="current"
              type="password"
              required
              className={inputClass}
              autoComplete="current-password"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Новый пароль</span>
            <input
              name="next"
              type="password"
              required
              minLength={6}
              className={inputClass}
              autoComplete="new-password"
            />
            <span className="mt-1 block text-xs text-muted">Минимум 6 символов.</span>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">
              Повторите новый пароль
            </span>
            <input
              name="next2"
              type="password"
              required
              minLength={6}
              className={inputClass}
              autoComplete="new-password"
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-accent px-6 py-2.5 font-semibold text-white hover:bg-accent-dark"
          >
            Изменить пароль
          </button>
        </form>
      </div>
    </div>
  );
}

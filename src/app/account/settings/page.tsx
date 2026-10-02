import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/userAuth";
import PasswordInput from "@/components/PasswordInput";
import { changePasswordAction, updateProfileAction } from "../actions";

import { inputClass, labelClass } from "@/components/ui/Input";
import { buttonClass } from "@/components/ui/Button";
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: "Настройки профиля",
  robots: { index: false, follow: false },
};

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
        <p className="mb-6 rounded-sm border border-success/30 bg-success/10 px-5 py-4 text-sm text-success">
          {ok}
        </p>
      )}
      {error && (
        <p className="mb-6 rounded-sm bg-accent-soft px-5 py-4 text-sm text-accent-hover">
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
            <span className={labelClass}>Имя</span>
            <input
              name="name"
              required
              defaultValue={user.name}
              className={inputClass}
              autoComplete="name"
            />
          </label>
          <label className="block">
            <span className={labelClass}>Email</span>
            <input
              name="email"
              type="email"
              required
              defaultValue={user.email}
              className={inputClass}
              autoComplete="email"
            />
            <span className="mt-1 block text-xs text-secondary">
              При смене email история ваших заказов сохраняется.
            </span>
          </label>
          <button
            type="submit"
            className={buttonClass("primary", "md")}
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
            <span className={labelClass}>Текущий пароль</span>
            <PasswordInput
              name="current"
              required
              className={inputClass}
              autoComplete="current-password"
            />
          </label>
          <label className="block">
            <span className={labelClass}>Новый пароль</span>
            <PasswordInput
              name="next"
              required
              minLength={6}
              className={inputClass}
              autoComplete="new-password"
            />
            <span className="mt-1 block text-xs text-secondary">Минимум 6 символов.</span>
          </label>
          <label className="block">
            <span className={labelClass}>
              Повторите новый пароль
            </span>
            <PasswordInput
              name="next2"
              required
              minLength={6}
              className={inputClass}
              autoComplete="new-password"
            />
          </label>
          <button
            type="submit"
            className={buttonClass("primary", "md")}
          >
            Изменить пароль
          </button>
        </form>
      </div>
    </div>
  );
}

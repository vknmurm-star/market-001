import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/userAuth";
import Honeypot from "@/components/Honeypot";
import PasswordInput from "@/components/PasswordInput";
import { loginAction } from "../actions";

import { inputClass, labelClass } from "@/components/ui/Input";
import { buttonClass } from "@/components/ui/Button";
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: "Вход",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (await getCurrentUser()) redirect("/account");
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : "";
  const reset = sp.reset === "1";

  return (
    <div className="container-page py-12 md:py-20">
      <div className="mx-auto max-w-md rounded-md bg-surface p-8 md:p-10">
        <h1 className="type-h4">Вход в кабинет</h1>
        <p className="mt-1 text-sm text-secondary">
          Войдите, чтобы видеть свои заказы.
        </p>

        {reset && (
          <p className="mt-4 rounded-sm border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
            Пароль изменён. Войдите с новым паролем.
          </p>
        )}

        <form action={loginAction} className="mt-6 space-y-4">
          <Honeypot />
          <label className="block">
            <span className={labelClass}>Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className={inputClass}
            />
          </label>
          <label className="block">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium">Пароль</span>
              <Link
                href="/account/forgot"
                className="text-xs text-accent underline-offset-4 hover:underline"
              >
                Забыли пароль?
              </Link>
            </div>
            <PasswordInput
              name="password"
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </label>

          {error && (
            <p className="rounded-sm bg-accent-soft px-4 py-3 text-sm text-accent-hover">
              {error}
            </p>
          )}

          <button
            type="submit"
            className={buttonClass("primary", "md", "w-full")}
          >
            Войти
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-secondary">
          Нет аккаунта?{" "}
          <Link href="/account/register" className="text-accent underline-offset-4 hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/userAuth";
import Honeypot from "@/components/Honeypot";
import PasswordInput from "@/components/PasswordInput";
import { registerAction } from "../actions";

import { inputClass, labelClass } from "@/components/ui/Input";
import { buttonClass } from "@/components/ui/Button";
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: "Регистрация",
  robots: { index: false, follow: false },
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (await getCurrentUser()) redirect("/account");
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : "";

  return (
    <div className="container-page py-12 md:py-20">
      <div className="mx-auto max-w-md rounded-md bg-surface p-8 md:p-10">
        <h1 className="type-h4">Регистрация</h1>
        <p className="mt-1 text-sm text-secondary">
          Создайте аккаунт, чтобы отслеживать заказы.
        </p>

        <form action={registerAction} className="mt-6 space-y-4">
          <Honeypot />
          <label className="block">
            <span className={labelClass}>Имя</span>
            <input
              name="name"
              required
              autoComplete="name"
              className={inputClass}
            />
          </label>
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
            <span className={labelClass}>Пароль</span>
            <PasswordInput
              name="password"
              required
              minLength={6}
              autoComplete="new-password"
              className={inputClass}
            />
            <span className="mt-1 block text-xs text-secondary">Минимум 6 символов.</span>
          </label>
          <label className="block">
            <span className={labelClass}>Повторите пароль</span>
            <PasswordInput
              name="password2"
              required
              minLength={6}
              autoComplete="new-password"
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
            Зарегистрироваться
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-secondary">
          Уже есть аккаунт?{" "}
          <Link href="/account/login" className="text-accent underline-offset-4 hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}

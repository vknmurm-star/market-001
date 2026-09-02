import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/userAuth";
import Honeypot from "@/components/Honeypot";
import PasswordInput from "@/components/PasswordInput";
import { loginAction } from "../actions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: "Вход",
  robots: { index: false, follow: false },
};

const inputClass =
  "w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent";

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
    <div className="container-page py-12">
      <div className="mx-auto max-w-sm rounded-2xl border bg-card p-8">
        <h1 className="text-2xl font-bold">Вход в кабинет</h1>
        <p className="mt-1 text-sm text-muted">
          Войдите, чтобы видеть свои заказы.
        </p>

        {reset && (
          <p className="mt-4 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
            Пароль изменён. Войдите с новым паролем.
          </p>
        )}

        <form action={loginAction} className="mt-6 space-y-4">
          <Honeypot />
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Email</span>
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
                className="text-xs text-accent hover:underline"
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
            <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent-dark">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-accent px-6 py-2.5 font-semibold text-white hover:bg-accent-dark"
          >
            Войти
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          Нет аккаунта?{" "}
          <Link href="/account/register" className="text-accent hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}

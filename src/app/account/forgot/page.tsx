import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/userAuth";
import Honeypot from "@/components/Honeypot";
import { forgotAction } from "../actions";

import { inputClass, labelClass } from "@/components/ui/Input";
import { buttonClass } from "@/components/ui/Button";
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: "Восстановление пароля",
  robots: { index: false, follow: false },
};

export default async function ForgotPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (await getCurrentUser()) redirect("/account");
  const sp = await searchParams;
  const sent = sp.sent === "1";
  const error = typeof sp.error === "string" ? sp.error : "";

  return (
    <div className="container-page py-12 md:py-20">
      <div className="mx-auto max-w-md rounded-md bg-surface p-8 md:p-10">
        <h1 className="type-h4">Восстановление пароля</h1>

        {sent ? (
          <>
            <p className="mt-4 rounded-sm border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
              Если аккаунт с таким email существует, мы отправили на него письмо
              со ссылкой для сброса пароля. Ссылка действует 1 час.
            </p>
            <p className="mt-2 text-xs text-secondary">
              Не пришло письмо? Проверьте папку «Спам» или попробуйте ещё раз чуть
              позже.
            </p>
            <Link
              href="/account/login"
              className="mt-6 inline-block text-sm text-accent hover:underline"
            >
              ← Вернуться ко входу
            </Link>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-secondary">
              Укажите email аккаунта, и мы пришлём ссылку для сброса пароля.
            </p>
            <form action={forgotAction} className="mt-6 space-y-4">
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
              {error && (
                <p className="rounded-sm bg-accent-soft px-4 py-3 text-sm text-accent-hover">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className={buttonClass("primary", "md", "w-full")}
              >
                Отправить ссылку
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-secondary">
              Вспомнили пароль?{" "}
              <Link href="/account/login" className="text-accent underline-offset-4 hover:underline">
                Войти
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

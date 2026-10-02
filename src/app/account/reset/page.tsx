import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/userAuth";
import Honeypot from "@/components/Honeypot";
import PasswordInput from "@/components/PasswordInput";
import { resetAction } from "../actions";

import { inputClass, labelClass } from "@/components/ui/Input";
import { buttonClass } from "@/components/ui/Button";
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: "Новый пароль",
  robots: { index: false, follow: false },
};

export default async function ResetPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (await getCurrentUser()) redirect("/account");
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : "";
  const error = typeof sp.error === "string" ? sp.error : "";

  return (
    <div className="container-page py-12 md:py-20">
      <div className="mx-auto max-w-md rounded-md bg-surface p-8 md:p-10">
        <h1 className="type-h4">Новый пароль</h1>

        {!token ? (
          <>
            <p className="mt-4 rounded-sm bg-accent-soft px-4 py-3 text-sm text-accent-hover">
              Ссылка неполная или недействительна.
            </p>
            <Link
              href="/account/forgot"
              className="mt-6 inline-block text-sm text-accent hover:underline"
            >
              Запросить сброс заново
            </Link>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-secondary">
              Придумайте новый пароль для входа в кабинет.
            </p>
            <form action={resetAction} className="mt-6 space-y-4">
              <Honeypot />
              <input type="hidden" name="token" value={token} />
              <label className="block">
                <span className={labelClass}>Новый пароль</span>
                <PasswordInput
                  name="next"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className={inputClass}
                />
                <span className="mt-1 block text-xs text-secondary">
                  Минимум 6 символов.
                </span>
              </label>
              <label className="block">
                <span className={labelClass}>
                  Повторите пароль
                </span>
                <PasswordInput
                  name="next2"
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
                Сохранить пароль
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

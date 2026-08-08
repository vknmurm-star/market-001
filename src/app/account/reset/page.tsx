import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/userAuth";
import Honeypot from "@/components/Honeypot";
import { resetAction } from "../actions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: "Новый пароль",
  robots: { index: false, follow: false },
};

const inputClass =
  "w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent";

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
    <div className="container-page py-12">
      <div className="mx-auto max-w-sm rounded-2xl border bg-card p-8">
        <h1 className="text-2xl font-bold">Новый пароль</h1>

        {!token ? (
          <>
            <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent-dark">
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
            <p className="mt-1 text-sm text-muted">
              Придумайте новый пароль для входа в кабинет.
            </p>
            <form action={resetAction} className="mt-6 space-y-4">
              <Honeypot />
              <input type="hidden" name="token" value={token} />
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Новый пароль</span>
                <input
                  name="next"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className={inputClass}
                />
                <span className="mt-1 block text-xs text-muted">
                  Минимум 6 символов.
                </span>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">
                  Повторите пароль
                </span>
                <input
                  name="next2"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
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
                Сохранить пароль
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

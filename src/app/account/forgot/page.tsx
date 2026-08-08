import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/userAuth";
import Honeypot from "@/components/Honeypot";
import { forgotAction } from "../actions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: "Восстановление пароля",
  robots: { index: false, follow: false },
};

const inputClass =
  "w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent";

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
    <div className="container-page py-12">
      <div className="mx-auto max-w-sm rounded-2xl border bg-card p-8">
        <h1 className="text-2xl font-bold">Восстановление пароля</h1>

        {sent ? (
          <>
            <p className="mt-4 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
              Если аккаунт с таким email существует, мы отправили на него письмо
              со ссылкой для сброса пароля. Ссылка действует 1 час.
            </p>
            <p className="mt-2 text-xs text-muted">
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
            <p className="mt-1 text-sm text-muted">
              Укажите email аккаунта — пришлём ссылку для сброса пароля.
            </p>
            <form action={forgotAction} className="mt-6 space-y-4">
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
              {error && (
                <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent-dark">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="w-full rounded-full bg-accent px-6 py-2.5 font-semibold text-white hover:bg-accent-dark"
              >
                Отправить ссылку
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-muted">
              Вспомнили пароль?{" "}
              <Link href="/account/login" className="text-accent hover:underline">
                Войти
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

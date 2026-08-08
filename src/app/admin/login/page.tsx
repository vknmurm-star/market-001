import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/adminAuth";
import { loginAction } from "../actions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (await isAdminAuthed()) redirect("/admin");
  const sp = await searchParams;
  const hasError = sp.error === "1";

  return (
    <div className="mx-auto max-w-sm rounded-2xl border bg-card p-8">
      <h1 className="mb-4 text-xl font-bold">Вход в админ-панель</h1>
      <form action={loginAction} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Пароль</span>
          <input
            name="password"
            type="password"
            required
            autoFocus
            className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
        </label>
        {hasError && (
          <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent-dark">
            Неверный пароль.
          </p>
        )}
        <button
          type="submit"
          className="w-full rounded-full bg-accent px-6 py-2.5 font-semibold text-white hover:bg-accent-dark"
        >
          Войти
        </button>
      </form>
    </div>
  );
}

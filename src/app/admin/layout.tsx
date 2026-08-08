import type { Metadata } from "next";
import Link from "next/link";
import { isAdminAuthed } from "@/lib/adminAuth";
import { logoutAction } from "./actions";

export const metadata: Metadata = {
  title: "Админ-панель",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdminAuthed();

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-wrap items-center gap-4 border-b pb-4">
        <span className="text-lg font-bold text-accent">Админ-панель · Маркет</span>
        {authed && (
          <>
            <nav className="flex gap-4 text-sm">
              <Link href="/admin" className="hover:text-accent">
                Товары
              </Link>
              <Link href="/admin/orders" className="hover:text-accent">
                Заказы
              </Link>
              <Link href="/admin/products/new" className="hover:text-accent">
                + Добавить товар
              </Link>
              <Link href="/admin/settings" className="hover:text-accent">
                Настройки
              </Link>
            </nav>
            <form action={logoutAction} className="ml-auto">
              <button className="text-sm text-muted hover:text-accent">Выйти</button>
            </form>
          </>
        )}
      </div>
      {children}
    </div>
  );
}

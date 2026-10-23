import type { Metadata } from "next";
import Link from "next/link";
import { getAdminRole } from "@/lib/adminAuth";
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
  const role = await getAdminRole();
  const authed = role !== null;
  const isDemo = role === "demo";

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-wrap items-center gap-4 border-b pb-4">
        <span className="text-lg font-bold text-accent">Админ-панель · Beauty</span>
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
              {!isDemo && (
                <Link href="/admin/settings" className="hover:text-accent">
                  Настройки
                </Link>
              )}
            </nav>
            {isDemo && (
              <span
                className="rounded-full bg-accent-soft px-3 py-1 text-xs text-accent-hover"
                title="Удаление товаров и настройки сайта недоступны"
              >
                Демо-доступ
              </span>
            )}
            <form action={logoutAction} className="ml-auto">
              <button className="text-sm text-secondary hover:text-accent">Выйти</button>
            </form>
          </>
        )}
      </div>
      {children}
    </div>
  );
}

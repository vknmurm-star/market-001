"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";
import type { Category } from "@/lib/types";

export default function Header({
  categories,
  logo,
}: {
  categories: Category[];
  logo?: string | null;
}) {
  const { count, ready } = useCart();
  const pathname = usePathname();
  const [userName, setUserName] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Статус авторизации подтягиваем на клиенте, чтобы не делать статические
  // страницы динамическими. Перечитываем при смене маршрута (вход/выход).
  useEffect(() => {
    let active = true;
    fetch("/api/me")
      .then((r) => r.json())
      .then((d: { user: { name: string; email: string } | null }) => {
        if (!active) return;
        setUserName(d.user ? d.user.name || d.user.email : null);
        setAuthReady(true);
      })
      .catch(() => active && setAuthReady(true));
    return () => {
      active = false;
    };
  }, [pathname]);

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  // подчёркивание для текстовых пунктов верхнего меню
  const navLink = (active: boolean) =>
    `hidden border-b-2 pb-0.5 text-sm font-medium transition-colors sm:inline ${
      active
        ? "border-accent text-accent"
        : "border-transparent hover:text-accent"
    } focus-visible:outline-none focus-visible:text-accent`;

  const accountActive = isActive("/account");

  return (
    <header className="sticky top-0 z-40 border-b bg-card/90 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container-page flex items-center gap-4 py-3">
        <Link
          href="/"
          aria-label="Маркет — на главную"
          className="flex shrink-0 items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {logo ? (
            // логотип заменяет текстовую надпись
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt="Маркет"
              className="h-9 w-auto max-h-10 object-contain"
            />
          ) : (
            <>
              <span className="text-2xl font-bold leading-none tracking-tight text-accent">
                Маркет
              </span>
              <span className="hidden text-sm text-muted sm:inline">
                косметика и красота
              </span>
            </>
          )}
        </Link>

        <form
          action="/catalog"
          role="search"
          className="ml-auto hidden max-w-md flex-1 items-center md:flex"
        >
          <input
            type="search"
            name="q"
            placeholder="Поиск товаров…"
            aria-label="Поиск товаров"
            className="w-full rounded-l-full border border-r-0 bg-background px-4 py-2 text-sm outline-none transition focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-r-full border border-l-0 border-accent bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
          >
            Найти
          </button>
        </form>

        <nav className="ml-auto flex items-center gap-5 md:ml-4">
          <Link href="/catalog" className={navLink(isActive("/catalog", true))}>
            Каталог
          </Link>
          {authReady && userName ? (
            <Link
              href="/account"
              title="Личный кабинет"
              className={`hidden max-w-[10rem] items-center gap-1 border-b-2 pb-0.5 text-sm font-medium transition-colors sm:inline-flex ${
                accountActive
                  ? "border-accent text-accent"
                  : "border-transparent hover:text-accent"
              }`}
            >
              <span aria-hidden>👤</span>
              <span className="truncate">{userName}</span>
            </Link>
          ) : (
            <Link href="/account/login" className={navLink(accountActive)}>
              Войти
            </Link>
          )}
          <Link
            href="/cart"
            aria-current={isActive("/cart", true) ? "page" : undefined}
            className={`relative flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 ${
              isActive("/cart", true)
                ? "bg-accent text-white"
                : "bg-accent-soft text-accent-dark hover:bg-accent hover:text-white"
            }`}
          >
            Корзина
            {ready && count > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-accent">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>

      <div className="border-t bg-background/60">
        <nav
          aria-label="Категории"
          className="container-page flex gap-1 overflow-x-auto py-1.5 text-sm"
        >
          {categories.map((c) => {
            const active = isActive(`/catalog/${c.slug}`, true);
            return (
              <Link
                key={c.slug}
                href={`/catalog/${c.slug}`}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  active
                    ? "bg-accent-soft font-medium text-accent-dark"
                    : "text-muted hover:text-accent"
                }`}
              >
                {c.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

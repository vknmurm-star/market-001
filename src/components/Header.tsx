"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import type { Category } from "@/lib/types";

export default function Header({ categories }: { categories: Category[] }) {
  const { count, ready } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur">
      <div className="container-page flex items-center gap-4 py-3">
        <Link href="/" className="flex items-baseline gap-2 shrink-0">
          <span className="text-2xl font-bold tracking-tight text-accent">
            Маркет
          </span>
          <span className="hidden text-sm text-muted sm:inline">
            косметика и красота
          </span>
        </Link>

        <form
          action="/catalog"
          className="ml-auto hidden max-w-md flex-1 items-center md:flex"
        >
          <input
            type="search"
            name="q"
            placeholder="Поиск товаров…"
            aria-label="Поиск товаров"
            className="w-full rounded-l-full border border-r-0 bg-background px-4 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-r-full border border-l-0 border-accent bg-accent px-4 py-2 text-sm font-medium text-white"
          >
            Найти
          </button>
        </form>

        <nav className="ml-auto flex items-center gap-4 md:ml-4">
          <Link
            href="/catalog"
            className="hidden text-sm font-medium hover:text-accent sm:inline"
          >
            Каталог
          </Link>
          <Link
            href="/account"
            className="hidden text-sm font-medium hover:text-accent sm:inline"
          >
            Кабинет
          </Link>
          <Link
            href="/cart"
            className="relative flex items-center gap-1 rounded-full bg-accent-soft px-4 py-2 text-sm font-medium text-accent-dark hover:bg-accent hover:text-white"
          >
            Корзина
            {ready && count > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-white">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>

      <div className="border-t bg-background/60">
        <div className="container-page flex gap-4 overflow-x-auto py-2 text-sm">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/catalog/${c.slug}`}
              className="whitespace-nowrap text-muted hover:text-accent"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

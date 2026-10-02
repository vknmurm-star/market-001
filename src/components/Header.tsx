"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";
import type { Category } from "@/lib/types";
import {
  BagIcon,
  ChevronDown,
  CloseIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "./ui/icons";

const NAV_LINK =
  "link-underline type-small font-medium text-foreground transition-colors ease-brand hover:text-accent";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const catsRef = useRef<HTMLDivElement>(null);

  // Статус авторизации подтягиваем на клиенте, чтобы не делать статические
  // страницы динамическими. Перечитываем при смене маршрута (вход/выход).
  useEffect(() => {
    let active = true;
    fetch("/api/me")
      .then((r) => r.json())
      .then((d: { user: { name: string; email: string } | null }) => {
        if (!active) return;
        setUserName(d.user ? d.user.name || d.user.email : null);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [pathname]);

  // Закрываем меню и выпадашку при переходе на другую страницу
  // (сброс состояния прямо при рендере — без setState внутри эффекта).
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setMenuOpen(false);
    setCatsOpen(false);
  }

  // Мобильное меню: блокируем прокрутку страницы, Esc закрывает.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Выпадающие «Категории»: Esc и клик снаружи закрывают.
  useEffect(() => {
    if (!catsOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCatsOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!catsRef.current?.contains(e.target as Node)) setCatsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [catsOpen]);

  const is = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const cur = (active: boolean) => (active ? ("page" as const) : undefined);

  const accountHref = userName ? "/account" : "/account/login";
  const accountLabel = userName ? `Личный кабинет: ${userName}` : "Войти";
  const iconBtn =
    "relative flex h-11 w-11 items-center justify-center rounded-sm text-foreground transition-colors ease-brand hover:text-accent";

  return (
    <header className="sticky top-0 z-40 border-b border-border-soft bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container-page flex h-[72px] items-center gap-6 lg:h-[88px] lg:gap-10">
        <Link
          href="/"
          aria-label="Beauty, на главную"
          className="flex shrink-0 items-center rounded-sm"
        >
          {logo ? (
            // Явные width/height + next/image: исходник логотипа из админки
            // 500×434, рендерится ~48px высотой (см. PageSpeed).
            <Image
              src={logo}
              alt="Beauty"
              width={112}
              height={97}
              className="h-11 w-auto object-contain mix-blend-multiply lg:h-12"
            />
          ) : (
            <span className="font-display text-[34px] font-medium leading-none tracking-[-0.01em] text-foreground lg:text-[40px]">
              Beauty
            </span>
          )}
        </Link>

        {/* десктоп-меню */}
        <nav aria-label="Основное меню" className="hidden items-center gap-10 lg:flex">
          <Link
            href="/catalog"
            aria-current={cur(is("/catalog", true))}
            className={NAV_LINK}
          >
            Каталог
          </Link>

          <div
            ref={catsRef}
            className="relative"
            onMouseEnter={() => setCatsOpen(true)}
            onMouseLeave={() => setCatsOpen(false)}
          >
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={catsOpen}
              aria-current={cur(pathname.startsWith("/catalog/"))}
              onClick={() => setCatsOpen((v) => !v)}
              className={`${NAV_LINK} inline-flex items-center gap-1.5`}
            >
              Категории
              <ChevronDown
                className={`transition-transform ease-brand ${catsOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`absolute left-1/2 top-full w-64 -translate-x-1/2 pt-4 transition-all ease-brand ${
                catsOpen
                  ? "visible translate-y-0 opacity-100"
                  : "invisible -translate-y-1 opacity-0"
              }`}
            >
              <ul className="rounded-md border border-border-soft bg-surface p-2 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/catalog/${c.slug}`}
                      aria-current={cur(is(`/catalog/${c.slug}`, true))}
                      tabIndex={catsOpen ? 0 : -1}
                      className="type-small block rounded-sm px-4 py-2.5 text-foreground transition-colors ease-brand hover:bg-surface-alt hover:text-accent aria-[current=page]:text-accent"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Link href="/about" aria-current={cur(is("/about", true))} className={NAV_LINK}>
            О нас
          </Link>
          <Link
            href="/delivery"
            aria-current={cur(is("/delivery", true))}
            className={NAV_LINK}
          >
            Доставка
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:gap-3">
          {/* поиск — только на широких экранах; на мобильных он в меню */}
          <form
            action="/catalog"
            role="search"
            className="hidden items-center gap-2 border-b border-border lg:flex"
          >
            <SearchIcon size={18} className="shrink-0 text-secondary" />
            <input
              type="search"
              name="q"
              placeholder="Поиск товаров…"
              aria-label="Поиск товаров"
              className="type-small h-10 w-40 bg-transparent text-foreground outline-none placeholder:text-muted xl:w-56"
            />
            <button type="submit" className="sr-only">
              Найти
            </button>
          </form>

          <Link
            href={accountHref}
            aria-label={accountLabel}
            title={accountLabel}
            aria-current={cur(is("/account"))}
            className={`${iconBtn} ${is("/account") ? "text-accent" : ""}`}
          >
            <UserIcon />
          </Link>

          <Link
            href="/cart"
            aria-label={
              ready && count > 0 ? `Корзина, товаров: ${count}` : "Корзина"
            }
            aria-current={cur(is("/cart", true))}
            className={`${iconBtn} ${is("/cart", true) ? "text-accent" : ""}`}
          >
            <BagIcon />
            {ready && count > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-none text-white">
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
            className={`${iconBtn} lg:hidden`}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* мобильное меню: absolute под шапкой (у шапки backdrop-filter, поэтому
          fixed-потомок позиционировался бы относительно неё, а не экрана) */}
      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-border-soft bg-background lg:hidden"
      >
        <div className="container-page py-6">
          <form action="/catalog" role="search" className="flex items-center gap-3 border-b border-border pb-3">
            <SearchIcon size={20} className="shrink-0 text-secondary" />
            <input
              type="search"
              name="q"
              placeholder="Поиск товаров…"
              aria-label="Поиск товаров"
              className="h-10 w-full bg-transparent text-[16px] text-foreground outline-none placeholder:text-muted"
            />
            <button type="submit" className="type-button text-accent">
              Найти
            </button>
          </form>

          <nav aria-label="Мобильное меню" className="mt-4">
            <ul className="divide-y divide-border-soft">
              {[
                ["/catalog", "Каталог", true],
                ["/about", "О нас", true],
                ["/delivery", "Доставка", true],
              ].map(([href, label, exact]) => (
                <li key={href as string}>
                  <Link
                    href={href as string}
                    aria-current={cur(is(href as string, exact as boolean))}
                    className="block py-4 font-display text-[26px] leading-none text-foreground aria-[current=page]:text-accent"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="type-caption mt-6 text-secondary">Категории</p>
            <ul className="mt-2 grid grid-cols-2 gap-x-6">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/catalog/${c.slug}`}
                    aria-current={cur(is(`/catalog/${c.slug}`, true))}
                    className="type-small block py-2.5 text-foreground aria-[current=page]:text-accent"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href={accountHref}
              className="type-button mt-6 inline-flex items-center gap-2 text-accent"
            >
              <UserIcon size={18} />
              {userName ? "Личный кабинет" : "Войти или зарегистрироваться"}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

import Image from "next/image";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import type { Category } from "@/lib/types";
import { MastercardMark, MirMark, SbpMark, VisaMark } from "./ui/icons";

const linkClass =
  "link-underline type-small inline-block text-secondary transition-colors ease-brand hover:text-accent";

/**
 * Подвал по макету: бренд, три колонки ссылок и колонка «Оплата».
 * Ссылки — только на реально существующие страницы; контакты (телефон,
 * email, часы работы) не выводим — на /contacts они помечены как демо.
 */
export default function Footer({
  categories,
  logo,
}: {
  categories: Category[];
  logo?: string | null;
}) {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="container-page grid gap-12 pb-14 pt-16 sm:grid-cols-2 md:pt-24 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr]">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link href="/" aria-label="Beauty — на главную" className="inline-block">
            {logo ? (
              <Image
                src={logo}
                alt="Beauty"
                width={112}
                height={97}
                className="h-12 w-auto object-contain mix-blend-multiply"
              />
            ) : (
              <span className="font-display text-[40px] font-medium leading-none tracking-[-0.01em] text-foreground">
                {SITE_NAME}
              </span>
            )}
          </Link>
          <p className="type-caption mt-4 text-[10px] text-secondary">
            Интернет-магазин косметики
          </p>
          <p className="type-small mt-4 max-w-xs text-secondary">
            Уход за лицом и телом, волосы, макияж, парфюмерия и аксессуары.
            Доставка по России и самовывоз.
          </p>
        </div>

        <nav aria-label="Каталог">
          <h2 className="font-sans text-[15px] font-semibold text-foreground">Каталог</h2>
          <ul className="mt-5 space-y-3">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/catalog/${c.slug}`} className={linkClass}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Покупателям">
          <h2 className="font-sans text-[15px] font-semibold text-foreground">
            Покупателям
          </h2>
          <ul className="mt-5 space-y-3">
            <li>
              <Link href="/delivery" className={linkClass}>
                Доставка и оплата
              </Link>
            </li>
            <li>
              <Link href="/cart" className={linkClass}>
                Корзина
              </Link>
            </li>
            <li>
              <Link href="/account" className={linkClass}>
                Личный кабинет
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Компания">
          <h2 className="font-sans text-[15px] font-semibold text-foreground">Компания</h2>
          <ul className="mt-5 space-y-3">
            <li>
              <Link href="/about" className={linkClass}>
                О нас
              </Link>
            </li>
            <li>
              <Link href="/contacts" className={linkClass}>
                Контакты
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="font-sans text-[15px] font-semibold text-foreground">Оплата</h2>
          <ul
            aria-label="Способы оплаты"
            className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3"
          >
            <li>
              <MirMark />
            </li>
            <li>
              <VisaMark />
            </li>
            <li>
              <MastercardMark />
            </li>
            <li>
              <SbpMark />
            </li>
          </ul>
          <p className="type-small mt-5 text-secondary">
            Картой онлайн, через СБП или при получении.
          </p>
        </div>
      </div>

      <div className="border-t border-border bg-surface-alt">
        <div className="container-page flex flex-col gap-1 py-5 text-[13px] text-secondary md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE_NAME}. Все права защищены.
          </p>
          <p>Демонстрационный проект: заказы не обрабатываются, оплата в тестовом режиме.</p>
        </div>
      </div>
    </footer>
  );
}

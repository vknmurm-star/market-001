import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import type { Category } from "@/lib/types";

export default function Footer({ categories }: { categories: Category[] }) {
  return (
    <footer className="mt-16 border-t bg-card">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="text-lg font-bold text-accent">Маркет</div>
          <p className="mt-2 text-sm text-muted">
            Интернет-магазин косметики и средств для красоты. Доставка курьером
            и самовывоз.
          </p>
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold">Категории</div>
          <ul className="space-y-1 text-sm text-muted">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/catalog/${c.slug}`} className="hover:text-accent">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold">Покупателям</div>
          <ul className="space-y-1 text-sm text-muted">
            <li>
              <Link href="/catalog" className="hover:text-accent">
                Весь каталог
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-accent">
                Корзина
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-accent">
                Личный кабинет
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold">Контакты</div>
          <ul className="space-y-1 text-sm text-muted">
            <li>Пн–Вс, 9:00–21:00</li>
            <li>Доставка по России</li>
            <li className="text-xs">
              Демо-магазин. Заказы не обрабатываются, оплата в тестовом режиме.
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="container-page py-4 text-xs text-muted">
          © {new Date().getFullYear()} {SITE_NAME}. Демонстрационный проект.
        </div>
      </div>
    </footer>
  );
}

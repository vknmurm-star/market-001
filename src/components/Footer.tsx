import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import type { Category } from "@/lib/types";

export default function Footer({
  categories,
  logo,
}: {
  categories: Category[];
  logo?: string | null;
}) {
  return (
    <footer className="mt-16 border-t bg-card">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="Beauty" className="h-9 w-auto object-contain" />
          ) : (
            <div className="text-lg font-bold text-accent">Beauty</div>
          )}
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
              <Link href="/about" className="hover:text-accent">
                О магазине
              </Link>
            </li>
            <li>
              <Link href="/delivery" className="hover:text-accent">
                Доставка и оплата
              </Link>
            </li>
            <li>
              <Link href="/contacts" className="hover:text-accent">
                Контакты
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
            <li>8 800 000-00-00</li>
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

import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "О магазине",
  description:
    "Маркет — интернет-магазин косметики и средств для красоты: уход за лицом и телом, волосы, макияж, парфюмерия и аксессуары.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="container-page py-8">
      <Breadcrumbs
        items={[
          { name: "Главная", href: "/" },
          { name: "О магазине", href: "/about" },
        ]}
      />
      <div className="mt-6 max-w-3xl">
        <h1 className="text-3xl font-bold">О магазине</h1>
        <div className="mt-5 space-y-4 leading-relaxed text-foreground/90">
          <p>
            «Маркет» — интернет-магазин косметики и средств для красоты. Мы
            собрали в одном месте уход за лицом и телом, средства для волос,
            макияж, парфюмерию и аксессуары — чтобы вы легко нашли всё нужное для
            ежедневного ухода и хорошего настроения.
          </p>
          <p>
            В каталоге — {"более 20 позиций"} в шести категориях. Для каждого
            товара указаны честная цена, наличие на складе и подробное описание,
            а похожие товары помогают подобрать подходящую альтернативу.
          </p>
          <p>
            Мы работаем напрямую с покупателем: оформляете заказ на сайте,
            выбираете удобный способ оплаты и получаете товар курьером или на
            самовывозе.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ["Большой выбор", "Косметика и уход в 6 категориях"],
            ["Честные цены", "Актуальная стоимость и остатки"],
            ["Удобная доставка", "Курьер по России и самовывоз"],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl border bg-card p-5">
              <div className="font-semibold">{t}</div>
              <div className="mt-1 text-sm text-muted">{d}</div>
            </div>
          ))}
        </div>

        <p className="mt-8 rounded-2xl bg-accent-soft p-4 text-sm text-accent-dark">
          Обратите внимание: это демонстрационный магазин, созданный как
          портфолио-проект. Заказы не обрабатываются, оплата работает в тестовом
          режиме.
        </p>
      </div>
    </div>
  );
}

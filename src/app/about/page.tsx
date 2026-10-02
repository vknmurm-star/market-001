import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "О магазине",
  description:
    "Beauty, интернет-магазин косметики и средств для красоты. Уход за лицом и телом, волосы, макияж, парфюмерия и аксессуары.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="container-page pb-16 pt-8 md:pb-24 md:pt-12">
      <Breadcrumbs
        items={[
          { name: "Главная", href: "/" },
          { name: "О магазине", href: "/about" },
        ]}
      />
      <div className="mt-8 max-w-3xl md:mt-10">
        <p className="type-caption mb-4 text-secondary">Beauty</p>
        <h1 className="type-h2">О магазине</h1>
        <div className="type-body-lg mt-8 space-y-5 text-secondary">
          <p>
            Добро пожаловать в «Beauty», интернет-магазин косметики и средств для красоты. Мы
            собрали в одном месте уход за лицом и телом, средства для волос,
            макияж, парфюмерию и аксессуары, чтобы вы легко нашли всё нужное для
            ежедневного ухода и хорошего настроения.
          </p>
          <p>
            В каталоге {"более 20 позиций"} в шести категориях. Для каждого
            товара указаны честная цена, наличие на складе и подробное описание,
            а похожие товары помогают подобрать подходящую альтернативу.
          </p>
          <p>
            Мы работаем напрямую с покупателем: оформляете заказ на сайте,
            выбираете удобный способ оплаты и получаете товар курьером или на
            самовывозе.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3 md:gap-6">
          {[
            ["Большой выбор", "Косметика и уход в 6 категориях"],
            ["Честные цены", "Актуальная стоимость и остатки"],
            ["Удобная доставка", "Курьер по России и самовывоз"],
          ].map(([t, d]) => (
            <div key={t} className="rounded-md bg-surface p-6 md:p-7">
              <div className="font-display text-[26px] leading-tight">{t}</div>
              <div className="type-small mt-2 text-secondary">{d}</div>
            </div>
          ))}
        </div>

        <p className="type-small mt-12 rounded-md bg-surface-alt p-5 text-secondary">
          Обратите внимание: это демонстрационный магазин, созданный как
          портфолио-проект. Заказы не обрабатываются, оплата работает в тестовом
          режиме.
        </p>
      </div>
    </div>
  );
}

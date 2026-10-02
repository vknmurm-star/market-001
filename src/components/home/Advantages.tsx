import { plural } from "@/lib/format";
import { CardIcon, LayersIcon, ReturnIcon, TruckIcon } from "@/components/ui/icons";

/**
 * Полоса преимуществ: 4 пункта с тонкими линейными иконками. Формулировки —
 * только то, что магазин реально делает (службы доставки и способы оплаты
 * совпадают с чекаутом, число категорий — из базы).
 */
export default function Advantages({ categoriesCount }: { categoriesCount: number }) {
  const items = [
    {
      icon: <TruckIcon />,
      title: "Доставка по России",
      text: "СДЭК, Boxberry, DPD, 5Post, Почта России",
    },
    {
      icon: <CardIcon />,
      title: "Удобная оплата",
      text: "Картой онлайн, через СБП или при получении",
    },
    {
      icon: <LayersIcon />,
      title: "Большой выбор",
      text: `Косметика в ${categoriesCount} ${plural(categoriesCount, [
        "категории",
        "категориях",
        "категориях",
      ])}`,
    },
    {
      icon: <ReturnIcon />,
      title: "Возврат 14 дней",
      text: "Если товар не подошёл",
    },
  ];

  return (
    <section aria-label="Преимущества магазина" className="border-y border-border-soft bg-surface">
      <ul className="container-page grid grid-cols-2 gap-x-6 gap-y-8 py-8 lg:grid-cols-4 lg:gap-0 lg:py-10">
        {items.map((it, i) => (
          <li
            key={it.title}
            className={`flex items-start gap-4 lg:px-8 ${
              i > 0 ? "lg:border-l lg:border-border" : "lg:pl-0"
            }`}
          >
            <span className="mt-0.5 shrink-0 text-accent">{it.icon}</span>
            <div>
              <p className="text-[15px] font-semibold leading-snug text-foreground">
                {it.title}
              </p>
              <p className="type-small mt-1 text-secondary">{it.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

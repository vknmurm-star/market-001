import { StarIcon } from "@/components/ui/icons";

/**
 * Отзывы: 3 карточки — звёзды, текст, имя и город; вместо фото — кружок с
 * инициалом. ВАЖНО: это иллюстративный контент для демо-витрины, а не
 * отзывы из базы; в JSON-LD (Review/AggregateRating) они намеренно НЕ
 * попадают.
 */
const REVIEWS = [
  {
    name: "Анастасия",
    city: "Москва",
    text: "Прекрасное качество, быстрая доставка и очень красивая упаковка. Кожа действительно выглядит лучше!",
  },
  {
    name: "Екатерина",
    city: "Санкт-Петербург",
    text: "Уже второй раз заказываю любимые средства. Всё тщательно упаковано, приятно, что магазин заботится о клиентах.",
  },
  {
    name: "Марина",
    city: "Казань",
    text: "Отличный ассортимент и внимательный сервис. Помогли подобрать уход, который идеально подошёл моей коже.",
  },
];

export default function Reviews() {
  return (
    <section aria-labelledby="reviews-title" className="section-y bg-surface">
      <div className="container-page">
        <p className="type-caption mb-4 text-secondary">Отзывы покупательниц</p>
        <h2 id="reviews-title" className="type-h2 max-w-xl">
          Ваши истории — наше вдохновение
        </h2>

        <ul className="mt-12 grid gap-4 md:grid-cols-3 md:gap-6">
          {REVIEWS.map((r) => (
            <li key={r.name} className="flex flex-col rounded-md bg-background p-6 md:p-8">
              <div
                className="flex gap-1 text-accent"
                role="img"
                aria-label="Оценка: 5 из 5"
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} />
                ))}
              </div>
              <blockquote className="type-body mt-5 flex-1 text-foreground">
                <span aria-hidden className="mr-1 font-display text-[28px] leading-none text-accent-light">
                  «
                </span>
                {r.text}
                <span aria-hidden className="ml-1 font-display text-[28px] leading-none text-accent-light">
                  »
                </span>
              </blockquote>
              <div className="mt-6 flex items-center gap-4 border-t border-border-soft pt-5">
                <span
                  aria-hidden
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-alt font-display text-[22px] text-accent"
                >
                  {r.name[0]}
                </span>
                <span>
                  <span className="block text-[15px] font-semibold leading-tight text-foreground">
                    {r.name}
                  </span>
                  <span className="type-small block text-secondary">{r.city}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

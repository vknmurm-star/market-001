"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Единственное место с путём к фото модели в hero — поменять здесь, если
 * появится другой кадр. Фото портретное (1536×2752), поэтому контейнер снизу
 * подобран под портретную ориентацию (aspect-[4/5] + object-top), чтобы лицо
 * и рука были в кадре целиком.
 */
export const HERO_PLACEHOLDER_IMAGE = "/images/hero/model-hero.png";

export interface HeroPreviewProduct {
  slug: string;
  sku: string;
  name: string;
  price: number;
  oldPrice: number | null;
  image: string | null;
  description: string;
  categoryName: string;
  stock: number;
}

/**
 * Содержимое аккордеона строим из РЕАЛЬНЫХ полей товара (Product в
 * src/lib/types.ts). В схеме нет отдельных колонок «свойства»/«состав» —
 * есть только description, categoryName, sku, stock. Поэтому:
 *  - «Описание» — description как есть;
 *  - «Свойства» — то, что реально есть (категория/артикул/наличие), а не
 *    выдуманные косметические свойства;
 *  - «Состав» — честно «не указан», если данных нет, а не сгенерированный
 *    список ингредиентов.
 */
function buildAccordionItems(p: HeroPreviewProduct) {
  return [
    {
      title: "Описание",
      body: p.description || "Описание пока не добавлено.",
    },
    {
      title: "Свойства",
      body: `Категория: ${p.categoryName}. Артикул: ${p.sku}. ${
        p.stock > 0 ? `В наличии: ${p.stock} шт.` : "Нет в наличии."
      }`,
    },
    {
      title: "Состав",
      body: "Информация о составе не указана производителем.",
    },
  ];
}

function formatPrice(value: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}

export default function HomeHero({
  previewProducts,
  imageSrc = HERO_PLACEHOLDER_IMAGE,
}: {
  previewProducts: HeroPreviewProduct[];
  imageSrc?: string;
}) {
  const [active, setActive] = useState(0);
  const current = previewProducts[active];

  const prev = () =>
    setActive((i) => (i - 1 + previewProducts.length) % previewProducts.length);
  const next = () => setActive((i) => (i + 1) % previewProducts.length);

  return (
    <section className="mb-12 overflow-hidden rounded-3xl bg-[#f3e6d3]">
      {/* Боковые колонки (текст / тёмная панель) — одинаковой ширины (4fr),
          фото модели посередине занимает оставшееся пространство (5fr). */}
      <div className="grid grid-cols-1 lg:grid-cols-[4fr_5fr_4fr]">
        {/* Текст */}
        <div className="flex flex-col justify-center gap-5 px-6 py-10 sm:px-10 sm:py-14">
          {/* Инлайн-стиль, а не text-[#2b2226] — в globals.css есть неслоёное
              h1,h2{color:var(--heading)}, которое побеждает Tailwind-утилиты
              по цвету текста на h1/h2; инлайн гарантированно выигрывает. */}
          <h1
            className="text-2xl italic leading-[1.15] sm:text-3xl lg:text-4xl"
            style={{ color: "#2b2226" }}
          >
            Откройте
            <br />
            сияющую красоту
            <br />с Beauty
          </h1>
          <p className="max-w-sm text-[15px] leading-relaxed text-[#5b4a3f]">
            В Beauty мы верим: красота — неповторима для каждого. Наша миссия —
            помочь вам раскрыть естественное сияние, которое уже есть в вас.
          </p>
          <div className="relative w-fit">
            <Link
              href="/catalog"
              className="inline-flex items-center rounded-full bg-[#c17862] px-5 py-2.5 text-sm font-semibold text-[#2b2226] shadow-sm transition hover:bg-[#a6624e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c17862] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f3e6d3]"
            >
              В каталог
            </Link>
            {/* «хвостик» речевого пузыря снизу-справа от кнопки —
                пропорционально уменьшен вместе с самой кнопкой (~0.7×). */}
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-1 right-4 h-2 w-2 rounded-full bg-[#c17862]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-2.5 right-2.5 h-1 w-1 rounded-full bg-[#c17862]"
            />
          </div>
        </div>

        {/* Фото модели.
            self-start — чтобы блок не растягивался по высоте строки грида и
            высоту всегда определял aspect-[4/5], а не соседние колонки;
            без этого портретное фото могло бы обрезаться непредсказуемо. */}
        <div className="relative aspect-[4/5] self-start overflow-hidden">
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover object-top"
            priority
          />
        </div>

        {/* Тёмная какао-панель — карусель товаров: фото/название/цена и
            аккордеон переключаются вместе стрелками внизу. */}
        <div className="flex flex-col justify-between gap-6 bg-[#4a3527] px-6 py-8 text-[#f3e8d9] sm:px-8">
          <h2 className="text-xl text-[#f3e8d9]">Детали товара</h2>

          {current && (
            <div className="flex flex-1 flex-col justify-center">
              {/* Квадратный контейнер (высота = ширине) под квадратные фото
                  товаров (1024×1024, полный непрозрачный фон) — object-cover
                  на точно совпадающих пропорциях не обрезает сам товар.
                  mx-auto центрирует его по горизонтали, не сжимая соседние
                  full-width элементы (название/цену/аккордеон). */}
              <Link
                href={`/product/${current.slug}`}
                className="group/photo relative mx-auto block h-20 w-20 overflow-hidden rounded-xl bg-white/10"
              >
                {current.image && (
                  <Image
                    src={current.image}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover transition duration-300 group-hover/photo:scale-105"
                  />
                )}
              </Link>

              <Link href={`/product/${current.slug}`} className="mt-3 block">
                <div className="line-clamp-2 text-sm font-medium leading-snug hover:underline">
                  {current.name}
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-base font-semibold">
                    {formatPrice(current.price)}
                  </span>
                  {current.oldPrice && current.oldPrice > current.price && (
                    <span className="text-xs text-[#d8c5ae] line-through">
                      {formatPrice(current.oldPrice)}
                    </span>
                  )}
                </div>
              </Link>

              <div className="mt-4 divide-y divide-white/15 border-t border-white/15">
                {buildAccordionItems(current).map((item) => (
                  <details key={item.title} className="group py-3">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium marker:content-none">
                      {item.title}
                      <span className="ml-3 text-base leading-none text-[#e0c9a6]">
                        <span className="group-open:hidden">+</span>
                        <span className="hidden group-open:inline">−</span>
                      </span>
                    </summary>
                    <p className="mt-2 text-xs leading-relaxed text-[#d8c5ae]">
                      {item.body}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={prev}
              aria-label="Предыдущий товар"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 text-sm transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              ←
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Следующий товар"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 text-sm transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

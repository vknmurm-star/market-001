import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import Image from "next/image";
import { getCategories, getFeaturedProducts } from "@/lib/catalog";
import ProductGrid from "@/components/ProductGrid";

export const dynamic = "force-dynamic";

/** Сгенерированное фото категории, если есть; иначе SVG-заглушка. */
function categoryImage(slug: string): string {
  const dir = path.join(process.cwd(), "public", "images", "categories");
  for (const ext of ["jpg", "png", "webp"]) {
    if (fs.existsSync(path.join(dir, `${slug}.${ext}`))) {
      return `/images/categories/${slug}.${ext}`;
    }
  }
  return `/products/${slug}.svg`;
}

export default function HomePage() {
  const categories = getCategories();
  const featured = getFeaturedProducts(8);

  return (
    <div className="container-page py-8">
      {/* Hero */}
      <section className="mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-accent-soft to-background p-8 md:p-14">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold leading-tight md:text-5xl">
            Косметика и уход для вашей красоты
          </h1>
          <p className="mt-4 text-lg text-muted">
            Уход за лицом и телом, средства для волос, макияж, парфюмерия и
            аксессуары. Честные цены, быстрая доставка курьером и самовывоз.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="rounded-full bg-accent px-6 py-3 font-semibold text-white hover:bg-accent-dark"
            >
              Перейти в каталог
            </Link>
            <Link
              href="/catalog?sort=price-asc"
              className="rounded-full border border-accent px-6 py-3 font-semibold text-accent-dark hover:bg-accent-soft"
            >
              Выгодные цены
            </Link>
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          ["🚚", "Доставка по России", "Курьером или самовывоз"],
          ["💳", "Удобная оплата", "Онлайн или при получении"],
          ["🧴", "Большой выбор", "Косметика в 6 категориях"],
          ["↩️", "Возврат 14 дней", "Если товар не подошёл"],
        ].map(([icon, title, sub]) => (
          <div
            key={title}
            className="flex items-start gap-3 rounded-2xl border bg-card p-4"
          >
            <span className="text-2xl" aria-hidden>
              {icon}
            </span>
            <div>
              <div className="text-sm font-semibold leading-tight">{title}</div>
              <div className="mt-0.5 text-xs text-muted">{sub}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Категории */}
      <section className="mb-12">
        <h2 className="mb-5 text-2xl font-bold">Категории</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/catalog/${c.slug}`}
              className="group flex flex-col items-center gap-3 rounded-2xl border bg-card p-4 text-center transition hover:shadow-md"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-xl">
                <Image
                  src={categoryImage(c.slug)}
                  alt={c.name}
                  fill
                  sizes="(max-width: 640px) 45vw, 15vw"
                  className="object-cover transition group-hover:scale-105"
                />
              </div>
              <span className="text-sm font-medium leading-tight group-hover:text-accent">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Популярные товары */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Популярные товары</h2>
          <Link href="/catalog" className="text-sm font-medium text-accent hover:underline">
            Смотреть все →
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { getCategories, getFeaturedProducts } from "@/lib/catalog";
import ProductGrid from "@/components/ProductGrid";

export const dynamic = "force-dynamic";

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
                  src={`/products/${c.slug}.svg`}
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

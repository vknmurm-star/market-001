import type { Metadata } from "next";
import { getPriceBounds, getProducts, type SortKey } from "@/lib/catalog";
import ProductGrid from "@/components/ProductGrid";
import CatalogControls from "@/components/CatalogControls";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SITE_DESCRIPTION } from "@/lib/site";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export function generateMetadata(): Metadata {
  return {
    title: "Каталог товаров",
    description: SITE_DESCRIPTION,
    alternates: { canonical: "/catalog" },
  };
}

function num(v: string | string[] | undefined): number | undefined {
  if (typeof v !== "string" || v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const query = typeof sp.q === "string" ? sp.q : undefined;
  const sort = (typeof sp.sort === "string" ? sp.sort : "popular") as SortKey;

  const bounds = getPriceBounds();
  const products = getProducts({
    query,
    minPrice: num(sp.min),
    maxPrice: num(sp.max),
    sort,
  });

  return (
    <div className="container-page pb-16 pt-8 md:pb-24 md:pt-12">
      <Breadcrumbs
        items={[
          { name: "Главная", href: "/" },
          { name: "Каталог", href: "/catalog" },
        ]}
      />

      <header className="mt-8 md:mt-10">
        <h1 className="type-h2">
          {query ? `Поиск: «${query}»` : "Каталог товаров"}
        </h1>
        <p className="type-body mt-4 text-secondary">
          Найдено товаров: {products.length}
        </p>
      </header>

      <div className="my-8 md:my-10">
        <CatalogControls bounds={bounds} />
      </div>

      <ProductGrid products={products} />
    </div>
  );
}

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
    <div className="container-page py-8">
      <Breadcrumbs
        items={[
          { name: "Главная", href: "/" },
          { name: "Каталог", href: "/catalog" },
        ]}
      />

      <h1 className="mb-2 mt-4 text-3xl font-bold">
        {query ? `Поиск: «${query}»` : "Каталог товаров"}
      </h1>
      <p className="mb-6 text-muted">
        Найдено товаров: {products.length}
      </p>

      <div className="mb-6">
        <CatalogControls bounds={bounds} />
      </div>

      <ProductGrid products={products} />
    </div>
  );
}

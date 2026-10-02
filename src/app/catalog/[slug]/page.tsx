import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCategoryBySlug,
  getPriceBounds,
  getProducts,
  type SortKey,
} from "@/lib/catalog";
import ProductGrid from "@/components/ProductGrid";
import CatalogControls from "@/components/CatalogControls";
import Breadcrumbs from "@/components/Breadcrumbs";
import { absoluteUrl, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: `${category.name} — купить в интернет-магазине косметики Beauty. Большой выбор, честные цены, доставка курьером и самовывоз.`,
    alternates: { canonical: `/catalog/${category.slug}` },
    openGraph: {
      title: category.name,
      url: absoluteUrl(`/catalog/${category.slug}`),
    },
  };
}

function num(v: string | string[] | undefined): number | undefined {
  if (typeof v !== "string" || v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const sp = await searchParams;
  const sort = (typeof sp.sort === "string" ? sp.sort : "popular") as SortKey;
  const bounds = getPriceBounds();
  const products = getProducts({
    categorySlug: category.slug,
    minPrice: num(sp.min),
    maxPrice: num(sp.max),
    sort,
  });

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    url: absoluteUrl(`/catalog/${category.slug}`),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/product/${p.slug}`,
        name: p.name,
      })),
    },
  };

  return (
    <div className="container-page pb-16 pt-8 md:pb-24 md:pt-12">
      <Breadcrumbs
        items={[
          { name: "Главная", href: "/" },
          { name: "Каталог", href: "/catalog" },
          { name: category.name, href: `/catalog/${category.slug}` },
        ]}
      />

      <header className="mt-8 md:mt-10">
        <p className="type-caption mb-4 text-secondary">Категория</p>
        <h1 className="type-h2">{category.name}</h1>
        <p className="type-body mt-4 text-secondary">
          Найдено товаров: {products.length}
        </p>
      </header>

      <div className="my-8 md:my-10">
        <CatalogControls bounds={bounds} />
      </div>

      <ProductGrid products={products} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
    </div>
  );
}

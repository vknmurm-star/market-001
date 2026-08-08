import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { absoluteUrl, formatPrice, SITE_NAME, SITE_URL } from "@/lib/site";
import PriceTag from "@/components/PriceTag";
import AddToCartButton from "@/components/AddToCartButton";
import ProductGrid from "@/components/ProductGrid";
import Breadcrumbs from "@/components/Breadcrumbs";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  const desc = product.description.slice(0, 160);
  return {
    title: product.name,
    description: desc,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description: desc,
      url: absoluteUrl(`/product/${product.slug}`),
      images: product.image ? [absoluteUrl(product.image)] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product, 4);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.image ? [absoluteUrl(product.image)] : undefined,
    category: product.categoryName,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${product.slug}`),
      priceCurrency: "RUB",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
  };

  return (
    <div className="container-page py-8">
      <Breadcrumbs
        items={[
          { name: "Главная", href: "/" },
          { name: "Каталог", href: "/catalog" },
          { name: product.categoryName, href: `/catalog/${product.categorySlug}` },
          { name: product.name, href: `/product/${product.slug}` },
        ]}
      />

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl border bg-card">
          <Image
            src={product.image ?? "/products/accessories.svg"}
            alt={`${product.name} — ${product.categoryName}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-sm uppercase tracking-wide text-muted">
            {product.categoryName}
          </span>
          <h1 className="mt-1 text-3xl font-bold leading-tight">{product.name}</h1>
          <div className="mt-2 text-sm text-muted">Артикул: {product.sku}</div>

          <div className="mt-5">
            <PriceTag price={product.price} oldPrice={product.oldPrice} size="lg" />
          </div>

          <div className="mt-3">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm text-success">
                ● В наличии: {product.stock} шт.
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 text-sm text-muted">
                ● Нет в наличии
              </span>
            )}
          </div>

          <p className="mt-5 leading-relaxed text-foreground/90">
            {product.description}
          </p>

          <div className="mt-6 flex items-center gap-4">
            <AddToCartButton
              className="px-8 py-3 text-base"
              product={{
                id: product.id,
                slug: product.slug,
                sku: product.sku,
                name: product.name,
                price: product.price,
                image: product.image,
                stock: product.stock,
              }}
            />
            <span className="text-sm text-muted">
              {formatPrice(product.price)} / шт.
            </span>
          </div>

          <ul className="mt-8 space-y-2 border-t pt-6 text-sm text-muted">
            <li>🚚 Доставка курьером по России или самовывоз</li>
            <li>💳 Оплата онлайн или при получении</li>
            <li>↩️ Возврат в течение 14 дней</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 text-2xl font-bold">Похожие товары</h2>
          <ProductGrid products={related} />
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
    </div>
  );
}

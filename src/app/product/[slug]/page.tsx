import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { getProductImages } from "@/lib/adminData";
import { absoluteUrl, formatPrice, SITE_NAME } from "@/lib/site";
import PriceTag from "@/components/PriceTag";
import AddToCartButton from "@/components/AddToCartButton";
import ProductGrid from "@/components/ProductGrid";
import ProductGallery from "@/components/ProductGallery";
import Breadcrumbs from "@/components/Breadcrumbs";
import SectionHeading from "@/components/ui/SectionHeading";
import { CardIcon, ReturnIcon, TruckIcon } from "@/components/ui/icons";

export const revalidate = 60;

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

  // Галерея: если у товара есть загруженные изображения — показываем их.
  // Иначе фолбэк: у сгенерированных плейсхолдеров по SKU есть второй ракурс
  // (/products/AC-003.svg -> /products/AC-003-2.svg), у прочих — одно фото.
  const uploaded = getProductImages(product.id);
  const gallery =
    uploaded.length > 0
      ? uploaded.map((i) => i.path)
      : (() => {
          const img = product.image;
          if (!img) return ["/products/accessories.svg"];
          if (/^\/products\/[A-Za-z]{2}-\d+\.svg$/.test(img)) {
            return [img, img.replace(/\.svg$/, "-2.svg")];
          }
          return [img];
        })();

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
    <div className="container-page pb-16 pt-8 md:pb-24 md:pt-12">
      <Breadcrumbs
        items={[
          { name: "Главная", href: "/" },
          { name: "Каталог", href: "/catalog" },
          { name: product.categoryName, href: `/catalog/${product.categorySlug}` },
          { name: product.name, href: `/product/${product.slug}` },
        ]}
      />

      <div className="mt-8 grid gap-10 md:mt-10 lg:grid-cols-[7fr_5fr] lg:gap-16">
        <ProductGallery
          images={gallery}
          alt={`${product.name} — ${product.categoryName}`}
        />

        <div className="flex flex-col lg:pt-4">
          <Link
            href={`/catalog/${product.categorySlug}`}
            className="type-caption link-underline w-fit text-secondary transition-colors ease-brand hover:text-accent"
          >
            {product.categoryName}
          </Link>
          <h1 className="type-h3 mt-4">{product.name}</h1>
          <p className="type-small mt-3 text-secondary">Артикул: {product.sku}</p>

          <div className="mt-7">
            <PriceTag price={product.price} oldPrice={product.oldPrice} size="lg" />
          </div>

          <p
            className={`type-small mt-4 inline-flex items-center gap-2 ${
              product.stock > 0 ? "text-success" : "text-secondary"
            }`}
          >
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
            {product.stock > 0 ? `В наличии: ${product.stock} шт.` : "Нет в наличии"}
          </p>

          <p className="type-body mt-7 text-secondary">{product.description}</p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <AddToCartButton
              className="min-w-56"
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
            <span className="type-small text-secondary">
              {formatPrice(product.price)} / шт.
            </span>
          </div>

          <ul className="type-small mt-10 space-y-3 border-t border-border pt-7 text-secondary">
            <li className="flex items-center gap-3">
              <TruckIcon size={22} className="shrink-0 text-accent" />
              Доставка курьером по России или самовывоз
            </li>
            <li className="flex items-center gap-3">
              <CardIcon size={22} className="shrink-0 text-accent" />
              Оплата онлайн или при получении
            </li>
            <li className="flex items-center gap-3">
              <ReturnIcon size={22} className="shrink-0 text-accent" />
              Возврат в течение 14 дней
            </li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 md:mt-28">
          <SectionHeading as="h2" size="h3" title="Похожие товары" />
          <div className="mt-8 md:mt-10">
            <ProductGrid products={related} />
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
    </div>
  );
}

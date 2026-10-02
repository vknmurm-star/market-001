import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { productBadges } from "@/lib/badges";
import PriceTag from "./PriceTag";
import AddToCartButton from "./AddToCartButton";

/**
 * Карточка товара по DESIGN.md: фон surface, радиус 8, фото 4/5, отступ 20.
 * Hover — подъём на 4px и мягкая тень. Кнопка «В корзину» видна всегда.
 */
export default function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const { discount, isHit, isNew } = productBadges(product);
  const badge =
    "type-caption rounded-sm px-2 py-1 text-[10px] leading-none tracking-[0.12em]";

  return (
    <article className="product-card group relative flex flex-col overflow-hidden rounded-md bg-surface transition duration-300 ease-brand hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-surface-alt"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
          {discount > 0 && (
            <span className={`${badge} bg-accent text-white`}>−{discount}%</span>
          )}
          {isHit && (
            <span className={`${badge} bg-surface text-foreground`}>Хит</span>
          )}
          {isNew && (
            <span className={`${badge} bg-surface text-foreground`}>Новинка</span>
          )}
        </div>
        <Image
          src={product.image ?? "/products/accessories.svg"}
          alt={`${product.name}, ${product.categoryName}`}
          fill
          preload={priority}
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 ease-brand group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <Link href={`/product/${product.slug}`} className="flex-1">
          <span className="type-caption text-[10px] tracking-[0.14em] text-secondary">
            {product.categoryName}
          </span>
          <h3 className="mt-1.5 line-clamp-2 font-sans text-[15px] font-medium leading-snug text-foreground transition-colors ease-brand group-hover:text-accent">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3">
          <PriceTag price={product.price} oldPrice={product.oldPrice} />
        </div>
        <p
          className={`mt-1.5 text-xs ${
            product.stock > 0 ? "text-success" : "text-secondary"
          }`}
        >
          {product.stock > 0 ? `В наличии: ${product.stock}` : "Нет в наличии"}
        </p>

        <AddToCartButton
          size="sm"
          className="card-cta mt-4"
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
      </div>
    </article>
  );
}

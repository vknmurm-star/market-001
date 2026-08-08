import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import PriceTag from "./PriceTag";
import AddToCartButton from "./AddToCartButton";

export default function ProductCard({ product }: { product: Product }) {
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition hover:shadow-lg">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-background"
      >
        {discount > 0 && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-accent px-2 py-1 text-xs font-bold text-white">
            −{discount}%
          </span>
        )}
        <Image
          src={product.image ?? "/products/accessories.svg"}
          alt={`${product.name} — ${product.categoryName}`}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link href={`/product/${product.slug}`} className="flex-1">
          <span className="text-xs uppercase tracking-wide text-muted">
            {product.categoryName}
          </span>
          <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug hover:text-accent">
            {product.name}
          </h3>
        </Link>

        <PriceTag price={product.price} oldPrice={product.oldPrice} />

        <div className="flex items-center justify-between">
          <span
            className={`text-xs ${
              product.stock > 0 ? "text-success" : "text-muted"
            }`}
          >
            {product.stock > 0 ? `В наличии: ${product.stock}` : "Нет в наличии"}
          </span>
          <AddToCartButton
            className="px-4 py-2"
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
      </div>
    </div>
  );
}

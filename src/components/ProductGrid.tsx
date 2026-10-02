import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

export default function ProductGrid({
  products,
  columns = 4,
}: {
  products: Product[];
  /** число колонок на широком экране (4 — каталог, 3 — «похожие») */
  columns?: 3 | 4;
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-md border border-border-soft bg-surface p-12 text-center text-secondary">
        Товары не найдены. Попробуйте изменить фильтры или поисковый запрос.
      </div>
    );
  }
  return (
    <div
      className={`grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 ${
        columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
      }`}
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

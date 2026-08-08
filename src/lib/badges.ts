import type { Product } from "./types";

// Небольшой курируемый набор «новинок» для демо-витрины.
const NEW_SKUS = new Set([
  "FC-004",
  "FC-002",
  "MK-003",
  "PF-003",
  "HC-004",
  "AC-003",
]);

export interface Badges {
  isNew: boolean;
  isHit: boolean;
  discount: number; // 0, если скидки нет
}

export function productBadges(p: Product): Badges {
  const discount =
    p.oldPrice && p.oldPrice > p.price
      ? Math.round((1 - p.price / p.oldPrice) * 100)
      : 0;
  return {
    isNew: NEW_SKUS.has(p.sku),
    isHit: p.popularity >= 45,
    discount,
  };
}

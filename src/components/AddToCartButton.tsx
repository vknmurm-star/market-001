"use client";

import { useState } from "react";
import { useCart, type CartItem } from "@/lib/cart";

export default function AddToCartButton({
  product,
  className = "",
}: {
  product: Omit<CartItem, "quantity">;
  className?: string;
}) {
  const { add, items } = useCart();
  const [added, setAdded] = useState(false);
  const inCart = items.find((i) => i.id === product.id)?.quantity ?? 0;
  const soldOut = product.stock <= 0;
  const limitReached = inCart >= product.stock;

  function handleClick() {
    if (soldOut || limitReached) return;
    add(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={soldOut || limitReached}
      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        added
          ? "bg-success text-white"
          : "bg-accent text-white hover:bg-accent-dark"
      } ${className}`}
    >
      {soldOut
        ? "Нет в наличии"
        : added
          ? "Добавлено ✓"
          : limitReached
            ? "Больше нет на складе"
            : "В корзину"}
    </button>
  );
}

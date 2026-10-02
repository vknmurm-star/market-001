"use client";

import { useState } from "react";
import { useCart, type CartItem } from "@/lib/cart";
import { buttonClass } from "./ui/Button";

export default function AddToCartButton({
  product,
  className = "",
  size = "md",
}: {
  product: Omit<CartItem, "quantity">;
  className?: string;
  size?: "md" | "sm";
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
      className={`${buttonClass("primary", size)} ${
        added ? "!bg-success hover:!bg-success" : ""
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

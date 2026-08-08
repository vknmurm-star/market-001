"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/site";

export default function CartPage() {
  const { items, total, setQuantity, remove, ready } = useCart();

  if (!ready) {
    return (
      <div className="container-page py-16 text-center text-muted">Загрузка…</div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-2xl font-bold">Корзина пуста</h1>
        <p className="mt-2 text-muted">
          Загляните в каталог — там много интересного.
        </p>
        <Link
          href="/catalog"
          className="mt-6 inline-block rounded-full bg-accent px-6 py-3 font-semibold text-white hover:bg-accent-dark"
        >
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-3xl font-bold">Корзина</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <ul className="space-y-4">
          {items.map((i) => (
            <li
              key={i.id}
              className="flex gap-4 rounded-2xl border bg-card p-4"
            >
              <Link
                href={`/product/${i.slug}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-background"
              >
                <Image
                  src={i.image ?? "/products/accessories.svg"}
                  alt={i.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </Link>

              <div className="flex flex-1 flex-col">
                <Link
                  href={`/product/${i.slug}`}
                  className="font-medium leading-snug hover:text-accent"
                >
                  {i.name}
                </Link>
                <span className="text-sm text-muted">Артикул: {i.sku}</span>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center rounded-full border">
                    <button
                      type="button"
                      aria-label="Уменьшить количество"
                      onClick={() => setQuantity(i.id, i.quantity - 1)}
                      className="px-3 py-1 text-lg leading-none hover:text-accent"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{i.quantity}</span>
                    <button
                      type="button"
                      aria-label="Увеличить количество"
                      onClick={() => setQuantity(i.id, i.quantity + 1)}
                      disabled={i.quantity >= i.stock}
                      className="px-3 py-1 text-lg leading-none hover:text-accent disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-semibold">
                    {formatPrice(i.price * i.quantity)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => remove(i.id)}
                aria-label="Удалить из корзины"
                className="self-start text-muted hover:text-accent"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-2xl border bg-card p-6 lg:sticky lg:top-28">
          <div className="flex items-center justify-between text-lg">
            <span>Итого</span>
            <span className="font-bold">{formatPrice(total)}</span>
          </div>
          <Link
            href="/checkout"
            className="mt-6 block rounded-full bg-accent px-6 py-3 text-center font-semibold text-white hover:bg-accent-dark"
          >
            Оформить заказ
          </Link>
          <Link
            href="/catalog"
            className="mt-3 block text-center text-sm text-muted hover:text-accent"
          >
            Продолжить покупки
          </Link>
        </aside>
      </div>
    </div>
  );
}

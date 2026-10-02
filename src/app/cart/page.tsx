"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/site";
import Button from "@/components/ui/Button";
import { CloseIcon } from "@/components/ui/icons";

export default function CartPage() {
  const { items, total, setQuantity, remove, ready } = useCart();

  if (!ready) {
    return (
      <div className="container-page py-24 text-center text-secondary">Загрузка…</div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center md:py-32">
        <h1 className="type-h3">Корзина пуста</h1>
        <p className="type-body mt-4 text-secondary">
          Загляните в каталог: там много интересного.
        </p>
        <div className="mt-8">
          <Button href="/catalog" arrow>
            Перейти в каталог
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page pb-16 pt-10 md:pb-24 md:pt-14">
      <h1 className="type-h3">Корзина</h1>

      <div className="mt-8 grid gap-10 md:mt-12 lg:grid-cols-[1fr_380px] lg:gap-16">
        <ul className="divide-y divide-border">
          {items.map((i) => (
            <li key={i.id} className="flex gap-4 py-6 first:pt-0 md:gap-6">
              <Link
                href={`/product/${i.slug}`}
                className="relative block aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-sm bg-surface-alt md:w-28"
              >
                <Image
                  src={i.image ?? "/products/accessories.svg"}
                  alt={i.name}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/product/${i.slug}`}
                    className="text-[15px] font-medium leading-snug text-foreground transition-colors ease-brand hover:text-accent md:text-base"
                  >
                    {i.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(i.id)}
                    aria-label="Удалить из корзины"
                    className="-mr-2 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm text-secondary transition-colors ease-brand hover:text-accent"
                  >
                    <CloseIcon size={18} />
                  </button>
                </div>
                <span className="type-small mt-1 text-secondary">Артикул: {i.sku}</span>

                <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                  <div className="flex items-center rounded-sm border border-border bg-white">
                    <button
                      type="button"
                      aria-label="Уменьшить количество"
                      onClick={() => setQuantity(i.id, i.quantity - 1)}
                      className="flex h-10 w-10 items-center justify-center text-lg leading-none transition-colors ease-brand hover:text-accent"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm" aria-live="polite">
                      {i.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Увеличить количество"
                      onClick={() => setQuantity(i.id, i.quantity + 1)}
                      disabled={i.quantity >= i.stock}
                      className="flex h-10 w-10 items-center justify-center text-lg leading-none transition-colors ease-brand hover:text-accent disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[17px] font-semibold text-foreground">
                    {formatPrice(i.price * i.quantity)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-md bg-surface p-7 md:p-8 lg:sticky lg:top-28">
          <div className="flex items-baseline justify-between">
            <span className="type-body text-secondary">Итого</span>
            <span className="text-[28px] font-semibold leading-none">
              {formatPrice(total)}
            </span>
          </div>
          <Button href="/checkout" className="mt-7 w-full">
            Оформить заказ
          </Button>
          <Link
            href="/catalog"
            className="link-underline type-small mx-auto mt-5 block w-fit text-secondary transition-colors ease-brand hover:text-accent"
          >
            Продолжить покупки
          </Link>
        </aside>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/site";
import Honeypot from "@/components/Honeypot";
import {
  DELIVERY_METHODS,
  DELIVERY_METHOD_LABELS,
  type DeliveryMethod,
} from "@/lib/types";

type Payment = "online" | "sbp" | "cash";

export default function CheckoutForm({
  initialName = "",
  initialEmail = "",
  isAuthed = false,
}: {
  initialName?: string;
  initialEmail?: string;
  isAuthed?: boolean;
}) {
  const { items, total, clear, ready } = useCart();
  const router = useRouter();
  const [payment, setPayment] = useState<Payment>("cash");
  const [delivery, setDelivery] = useState<DeliveryMethod>("cdek");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (ready && items.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-2xl font-bold">Корзина пуста</h1>
        <Link
          href="/catalog"
          className="mt-6 inline-block rounded-full bg-accent px-6 py-3 font-semibold text-white hover:bg-accent-dark"
        >
          В каталог
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: fd.get("name"),
          phone: fd.get("phone"),
          email: fd.get("email"),
          address: fd.get("address"),
          comment: fd.get("comment"),
          website: fd.get("website"), // honeypot
          deliveryMethod: delivery,
          paymentMethod: payment,
          items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка оформления заказа");
      clear();
      router.push(`/order/${data.orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка оформления заказа");
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent";

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-3xl font-bold">Оформление заказа</h1>

      {!isAuthed && (
        <p className="mb-6 rounded-2xl border bg-card p-4 text-sm text-muted">
          Оформляете как гость.{" "}
          <Link href="/account/login" className="text-accent hover:underline">
            Войдите
          </Link>{" "}
          или{" "}
          <Link href="/account/register" className="text-accent hover:underline">
            зарегистрируйтесь
          </Link>
          , чтобы заказы сохранялись в личном кабинете.
        </p>
      )}

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <Honeypot />
        <div className="space-y-5 rounded-2xl border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Имя *</span>
              <input
                name="name"
                required
                defaultValue={initialName}
                className={inputClass}
                autoComplete="name"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Телефон *</span>
              <input
                name="phone"
                required
                type="tel"
                className={inputClass}
                autoComplete="tel"
                placeholder="+7 900 000-00-00"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Email *</span>
            <input
              name="email"
              required
              type="email"
              defaultValue={initialEmail}
              readOnly={isAuthed}
              className={`${inputClass} ${isAuthed ? "opacity-70" : ""}`}
              autoComplete="email"
              placeholder="you@example.com"
            />
            {isAuthed && (
              <span className="mt-1 block text-xs text-muted">
                Email вашего аккаунта — заказ сохранится в кабинете.
              </span>
            )}
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Служба доставки</span>
            <select
              name="delivery"
              value={delivery}
              onChange={(e) => setDelivery(e.target.value as DeliveryMethod)}
              className={inputClass}
            >
              {DELIVERY_METHODS.map((d) => (
                <option key={d} value={d}>
                  {DELIVERY_METHOD_LABELS[d]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">
              Адрес / пункт выдачи
            </span>
            <input
              name="address"
              className={inputClass}
              autoComplete="street-address"
              placeholder="Город, улица, дом, квартира или адрес ПВЗ"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Комментарий к заказу</span>
            <textarea name="comment" rows={3} className={inputClass} />
          </label>

          <fieldset className="space-y-2">
            <legend className="mb-1 text-sm font-medium">Способ оплаты</legend>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:border-accent">
              <input
                type="radio"
                name="payment"
                checked={payment === "cash"}
                onChange={() => setPayment("cash")}
              />
              <span className="text-sm">При получении (курьеру / на самовывозе)</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:border-accent">
              <input
                type="radio"
                name="payment"
                checked={payment === "online"}
                onChange={() => setPayment("online")}
              />
              <span className="text-sm">
                Онлайн-оплата картой
                <span className="ml-1 rounded bg-accent-soft px-1.5 py-0.5 text-xs text-accent-dark">
                  ЮKassa · тестовый режим
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:border-accent">
              <input
                type="radio"
                name="payment"
                checked={payment === "sbp"}
                onChange={() => setPayment("sbp")}
              />
              <span className="text-sm">
                СБП — оплата по QR из банковского приложения
                <span className="ml-1 rounded bg-accent-soft px-1.5 py-0.5 text-xs text-accent-dark">
                  тестовый режим
                </span>
              </span>
            </label>
          </fieldset>
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border bg-card p-6 lg:sticky lg:top-28">
          <h2 className="font-semibold">Ваш заказ</h2>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-2">
                <span className="text-muted">
                  {i.name} × {i.quantity}
                </span>
                <span className="whitespace-nowrap">
                  {formatPrice(i.price * i.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t pt-3 text-lg">
            <span>Итого</span>
            <span className="font-bold">{formatPrice(total)}</span>
          </div>

          {error && (
            <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent-dark">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !ready}
            className="w-full rounded-full bg-accent px-6 py-3 font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
          >
            {submitting ? "Оформляем…" : "Подтвердить заказ"}
          </button>
          <p className="text-center text-xs text-muted">
            Демо-магазин: реальная оплата и доставка не производятся.
          </p>
        </aside>
      </form>
    </div>
  );
}

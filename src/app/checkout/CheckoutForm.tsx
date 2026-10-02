"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/site";
import Honeypot from "@/components/Honeypot";
import Button from "@/components/ui/Button";
import {
  inputClass,
  labelClass,
  selectClass,
  textareaClass,
} from "@/components/ui/Input";
import {
  DELIVERY_METHODS,
  DELIVERY_METHOD_LABELS,
  type DeliveryMethod,
} from "@/lib/types";

type Payment = "online" | "sbp" | "cash";

const PAYMENTS: { value: Payment; label: string; badge?: string }[] = [
  { value: "cash", label: "При получении (курьеру / на самовывозе)" },
  { value: "online", label: "Онлайн-оплата картой", badge: "ЮKassa · тестовый режим" },
  { value: "sbp", label: "СБП: оплата по QR из банковского приложения", badge: "тестовый режим" },
];

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
      <div className="container-page py-20 text-center md:py-32">
        <h1 className="type-h3">Корзина пуста</h1>
        <div className="mt-8">
          <Button href="/catalog" arrow>
            В каталог
          </Button>
        </div>
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

  return (
    <div className="container-page pb-16 pt-10 md:pb-24 md:pt-14">
      <h1 className="type-h3">Оформление заказа</h1>

      {!isAuthed && (
        <p className="type-small mt-6 rounded-md bg-surface px-5 py-4 text-secondary">
          Оформляете как гость.{" "}
          <Link href="/account/login" className="text-accent underline-offset-4 hover:underline">
            Войдите
          </Link>{" "}
          или{" "}
          <Link href="/account/register" className="text-accent underline-offset-4 hover:underline">
            зарегистрируйтесь
          </Link>
          , чтобы заказы сохранялись в личном кабинете.
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid gap-8 md:mt-10 lg:grid-cols-[1fr_400px] lg:gap-14"
      >
        <Honeypot />
        <div className="space-y-6 rounded-md bg-surface p-6 md:p-10">
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Имя *</span>
              <input
                name="name"
                required
                defaultValue={initialName}
                className={inputClass}
                autoComplete="name"
              />
            </label>
            <label className="block">
              <span className={labelClass}>Телефон *</span>
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
            <span className={labelClass}>Email *</span>
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
              <span className="type-small mt-1.5 block text-secondary">
                Email вашего аккаунта: заказ сохранится в кабинете.
              </span>
            )}
          </label>
          <label className="block">
            <span className={labelClass}>Служба доставки</span>
            <select
              name="delivery"
              value={delivery}
              onChange={(e) => setDelivery(e.target.value as DeliveryMethod)}
              className={selectClass}
            >
              {DELIVERY_METHODS.map((d) => (
                <option key={d} value={d}>
                  {DELIVERY_METHOD_LABELS[d]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Адрес / пункт выдачи</span>
            <input
              name="address"
              className={inputClass}
              autoComplete="street-address"
              placeholder="Город, улица, дом, квартира или адрес ПВЗ"
            />
          </label>
          <label className="block">
            <span className={labelClass}>Комментарий к заказу</span>
            <textarea name="comment" rows={3} className={textareaClass} />
          </label>

          <fieldset className="space-y-3">
            <legend className={labelClass}>Способ оплаты</legend>
            {PAYMENTS.map((p) => (
              <label
                key={p.value}
                className={`flex cursor-pointer items-center gap-4 rounded-sm border bg-white px-4 py-4 transition-colors ease-brand hover:border-accent ${
                  payment === p.value ? "border-accent" : "border-border"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={payment === p.value}
                  onChange={() => setPayment(p.value)}
                  className="h-4 w-4 shrink-0 accent-[#A8552E]"
                />
                <span className="text-[15px] leading-snug text-foreground">
                  {p.label}
                  {p.badge && (
                    <span className="ml-2 inline-block rounded-sm bg-accent-soft px-2 py-0.5 text-xs text-accent-hover">
                      {p.badge}
                    </span>
                  )}
                </span>
              </label>
            ))}
          </fieldset>
        </div>

        <aside className="h-fit space-y-5 rounded-md bg-surface p-7 md:p-8 lg:sticky lg:top-28">
          <h2 className="type-h4 !text-[26px]">Ваш заказ</h2>
          <ul className="space-y-3 text-sm">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3">
                <span className="text-secondary">
                  {i.name} × {i.quantity}
                </span>
                <span className="whitespace-nowrap text-foreground">
                  {formatPrice(i.price * i.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-baseline justify-between border-t border-border pt-5">
            <span className="type-body text-secondary">Итого</span>
            <span className="text-[28px] font-semibold leading-none">
              {formatPrice(total)}
            </span>
          </div>

          {error && (
            <p
              role="alert"
              className="type-small rounded-sm bg-accent-soft px-4 py-3 text-accent-hover"
            >
              {error}
            </p>
          )}

          <Button type="submit" disabled={submitting || !ready} className="w-full">
            {submitting ? "Оформляем…" : "Подтвердить заказ"}
          </Button>
          <p className="type-small text-center text-secondary">
            Демо-магазин: реальная оплата и доставка не производятся.
          </p>
        </aside>
      </form>
    </div>
  );
}

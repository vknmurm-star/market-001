import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/orders";
import { formatPrice } from "@/lib/site";
import { PAYMENT_METHOD_LABELS, ORDER_STATUS_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = Promise<{ number: string }>;

export const metadata: Metadata = {
  title: "Заказ оформлен",
  robots: { index: false, follow: false },
};

export default async function OrderPage({ params }: { params: Params }) {
  const { number } = await params;
  const order = getOrderByNumber(number);
  if (!order) notFound();

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border bg-card p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-3xl text-success">
            ✓
          </div>
          <h1 className="mt-4 text-2xl font-bold">Заказ оформлен!</h1>
          <p className="mt-2 text-muted">
            Спасибо за заказ. Номер вашего заказа:
          </p>
          <div className="mt-2 text-2xl font-bold text-accent">
            {order.orderNumber}
          </div>
          <p className="mt-2 text-sm text-muted">
            Статус: {ORDER_STATUS_LABELS[order.status]}. Мы свяжемся с вами по
            телефону {order.phone} для подтверждения.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border bg-card p-6">
          <h2 className="mb-3 font-semibold">Состав заказа</h2>
          <ul className="space-y-2 text-sm">
            {order.items?.map((i) => (
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
          <div className="mt-3 flex justify-between border-t pt-3 text-lg font-bold">
            <span>Итого</span>
            <span>{formatPrice(order.total)}</span>
          </div>
          <dl className="mt-4 space-y-1 border-t pt-4 text-sm text-muted">
            <div className="flex justify-between">
              <dt>Получатель</dt>
              <dd className="text-foreground">{order.customerName}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Оплата</dt>
              <dd className="text-foreground">
                {PAYMENT_METHOD_LABELS[order.paymentMethod]}
              </dd>
            </div>
            {order.address && (
              <div className="flex justify-between gap-4">
                <dt>Доставка</dt>
                <dd className="text-right text-foreground">{order.address}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/catalog"
            className="rounded-full bg-accent px-6 py-3 font-semibold text-white hover:bg-accent-dark"
          >
            Продолжить покупки
          </Link>
          <Link
            href="/account"
            className="rounded-full border border-accent px-6 py-3 font-semibold text-accent-dark hover:bg-accent-soft"
          >
            Мои заказы
          </Link>
        </div>
      </div>
    </div>
  );
}

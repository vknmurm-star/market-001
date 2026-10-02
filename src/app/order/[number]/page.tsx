import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/orders";
import { formatPrice } from "@/lib/site";
import Button from "@/components/ui/Button";
import {
  DELIVERY_METHOD_LABELS,
  PAYMENT_METHOD_LABELS,
  ORDER_STATUS_LABELS,
} from "@/lib/types";

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
    <div className="container-page pb-16 pt-10 md:pb-24 md:pt-16">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-md bg-surface p-8 text-center md:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-accent-light text-2xl text-accent">
            ✓
          </div>
          <h1 className="type-h3 mt-6">Заказ оформлен</h1>
          <p className="type-body mt-4 text-secondary">
            Спасибо за заказ. Номер вашего заказа:
          </p>
          <div className="mt-2 font-display text-[40px] leading-none text-accent">
            {order.orderNumber}
          </div>
          <p className="type-small mt-5 text-secondary">
            Статус: {ORDER_STATUS_LABELS[order.status]}. Мы свяжемся с вами по
            телефону {order.phone} для подтверждения.
          </p>
        </div>

        <div className="mt-6 rounded-md bg-surface p-7 md:p-10">
          <h2 className="type-caption mb-5 text-secondary">Состав заказа</h2>
          <ul className="space-y-3 text-[15px]">
            {order.items?.map((i) => (
              <li key={i.id} className="flex justify-between gap-4">
                <span className="text-secondary">
                  {i.name} × {i.quantity}
                </span>
                <span className="whitespace-nowrap text-foreground">
                  {formatPrice(i.price * i.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-baseline justify-between border-t border-border pt-5">
            <span className="type-body text-secondary">Итого</span>
            <span className="text-[28px] font-semibold leading-none">
              {formatPrice(order.total)}
            </span>
          </div>
          <dl className="type-small mt-6 space-y-2 border-t border-border pt-6 text-secondary">
            <div className="flex justify-between gap-4">
              <dt>Получатель</dt>
              <dd className="text-right text-foreground">{order.customerName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Оплата</dt>
              <dd className="text-right text-foreground">
                {PAYMENT_METHOD_LABELS[order.paymentMethod]}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Доставка</dt>
              <dd className="text-right text-foreground">
                {DELIVERY_METHOD_LABELS[order.deliveryMethod]}
              </dd>
            </div>
            {order.address && (
              <div className="flex justify-between gap-4">
                <dt>Адрес</dt>
                <dd className="text-right text-foreground">{order.address}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/catalog" arrow>
            Продолжить покупки
          </Button>
          <Button href="/account" variant="secondary">
            Мои заказы
          </Button>
        </div>
      </div>
    </div>
  );
}

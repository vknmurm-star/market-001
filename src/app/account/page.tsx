import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/userAuth";
import { getOrdersByEmail } from "@/lib/orders";
import { formatPrice } from "@/lib/site";
import {
  DELIVERY_METHOD_LABELS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/types";
import Button from "@/components/ui/Button";
import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Личный кабинет",
  description: "История заказов покупателя.",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await requireUser();
  const orders = getOrdersByEmail(user.email);

  return (
    <div className="container-page pb-16 pt-10 md:pb-24 md:pt-14">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="type-h3">Личный кабинет</h1>
          <p className="type-body mt-3 text-secondary">
            {user.name ? `${user.name} · ` : ""}
            {user.email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button href="/account/settings" variant="secondary" size="sm">
            Настройки
          </Button>
          <form action={logoutAction}>
            <Button type="submit" variant="secondary" size="sm">
              Выйти
            </Button>
          </form>
        </div>
      </div>

      <h2 className="type-h4 mb-6">Мои заказы</h2>

      {orders.length === 0 ? (
        <div className="rounded-md bg-surface p-12 text-center text-secondary">
          У вас пока нет заказов.{" "}
          <Link href="/catalog" className="text-accent underline-offset-4 hover:underline">
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-md bg-surface p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-display text-[26px] leading-none text-accent">
                    {o.orderNumber}
                  </span>
                  <span className="ml-3 text-sm text-secondary">
                    {new Date(o.createdAt).toLocaleString("ru-RU")}
                  </span>
                </div>
                <span className="rounded-sm bg-accent-soft px-3 py-1 text-sm text-accent-hover">
                  {ORDER_STATUS_LABELS[o.status]}
                </span>
              </div>
              <ul className="mt-3 space-y-1 text-sm">
                {o.items?.map((i) => (
                  <li key={i.id} className="flex justify-between gap-2">
                    <span className="text-secondary">
                      {i.name} × {i.quantity}
                    </span>
                    <span>{formatPrice(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
                <span className="text-sm text-secondary">
                  {DELIVERY_METHOD_LABELS[o.deliveryMethod]} ·{" "}
                  {PAYMENT_METHOD_LABELS[o.paymentMethod]}
                </span>
                <span className="text-[17px] font-semibold">{formatPrice(o.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

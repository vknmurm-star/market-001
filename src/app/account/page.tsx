import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/userAuth";
import { getOrdersByEmail } from "@/lib/orders";
import { formatPrice } from "@/lib/site";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/types";
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
    <div className="container-page py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Личный кабинет</h1>
          <p className="mt-1 text-muted">
            {user.name ? `${user.name} · ` : ""}
            {user.email}
          </p>
        </div>
        <form action={logoutAction}>
          <button className="rounded-full border border-accent px-5 py-2 text-sm font-semibold text-accent-dark hover:bg-accent-soft">
            Выйти
          </button>
        </form>
      </div>

      <h2 className="mb-4 text-xl font-semibold">Мои заказы</h2>

      {orders.length === 0 ? (
        <div className="rounded-2xl border bg-card p-10 text-center text-muted">
          У вас пока нет заказов.{" "}
          <Link href="/catalog" className="text-accent hover:underline">
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-accent">
                    {o.orderNumber}
                  </span>
                  <span className="ml-3 text-sm text-muted">
                    {new Date(o.createdAt).toLocaleString("ru-RU")}
                  </span>
                </div>
                <span className="rounded-full bg-accent-soft px-3 py-1 text-sm text-accent-dark">
                  {ORDER_STATUS_LABELS[o.status]}
                </span>
              </div>
              <ul className="mt-3 space-y-1 text-sm">
                {o.items?.map((i) => (
                  <li key={i.id} className="flex justify-between gap-2">
                    <span className="text-muted">
                      {i.name} × {i.quantity}
                    </span>
                    <span>{formatPrice(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between border-t pt-3">
                <span className="text-sm text-muted">
                  {PAYMENT_METHOD_LABELS[o.paymentMethod]}
                </span>
                <span className="font-bold">{formatPrice(o.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

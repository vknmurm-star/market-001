import type { Metadata } from "next";
import Link from "next/link";
import { getOrdersByEmail } from "@/lib/orders";
import { formatPrice } from "@/lib/site";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: "Личный кабинет",
  description: "История заказов покупателя.",
  robots: { index: false, follow: false },
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const email = typeof sp.email === "string" ? sp.email.trim() : "";
  const orders = email ? getOrdersByEmail(email) : [];

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-3xl font-bold">Личный кабинет</h1>

      <form
        method="get"
        className="mb-8 flex flex-wrap items-end gap-3 rounded-2xl border bg-card p-6"
      >
        <label className="flex-1">
          <span className="mb-1 block text-sm font-medium">
            Введите email, указанный при заказе
          </span>
          <input
            name="email"
            type="email"
            required
            defaultValue={email}
            placeholder="you@example.com"
            className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-accent px-6 py-2.5 font-semibold text-white hover:bg-accent-dark"
        >
          Показать заказы
        </button>
      </form>

      {email && orders.length === 0 && (
        <div className="rounded-2xl border bg-card p-10 text-center text-muted">
          Заказов для {email} не найдено.
        </div>
      )}

      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="rounded-2xl border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-accent">{o.orderNumber}</span>
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

      {!email && (
        <p className="text-sm text-muted">
          Нет заказов?{" "}
          <Link href="/catalog" className="text-accent hover:underline">
            Перейти в каталог
          </Link>
        </p>
      )}
    </div>
  );
}

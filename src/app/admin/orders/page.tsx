import { requireAdmin } from "@/lib/adminAuth";
import { getAllOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/site";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  type OrderStatus,
} from "@/lib/types";
import { setOrderStatusAction } from "../actions";

export const dynamic = "force-dynamic";

const STATUSES: OrderStatus[] = ["new", "processing", "done"];

const STATUS_STYLE: Record<OrderStatus, string> = {
  new: "bg-accent-soft text-accent-dark",
  processing: "bg-amber-100 text-amber-700",
  done: "bg-green-100 text-green-700",
};

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = getAllOrders();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Заказы</h1>

      {orders.length === 0 && (
        <div className="rounded-2xl border bg-card p-10 text-center text-muted">
          Заказов пока нет.
        </div>
      )}

      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="rounded-2xl border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="font-semibold text-accent">{o.orderNumber}</span>
                <span className="ml-3 text-sm text-muted">
                  {new Date(o.createdAt).toLocaleString("ru-RU")}
                </span>
                <div className="mt-1 text-sm">
                  {o.customerName} · {o.phone} · {o.email}
                </div>
                {o.address && (
                  <div className="text-sm text-muted">Доставка: {o.address}</div>
                )}
                {o.comment && (
                  <div className="text-sm text-muted">Комментарий: {o.comment}</div>
                )}
              </div>
              <span
                className={`rounded-full px-3 py-1 text-sm ${STATUS_STYLE[o.status]}`}
              >
                {ORDER_STATUS_LABELS[o.status]}
              </span>
            </div>

            <ul className="mt-3 space-y-1 border-t pt-3 text-sm">
              {o.items?.map((i) => (
                <li key={i.id} className="flex justify-between gap-2">
                  <span className="text-muted">
                    {i.name} <span className="text-xs">({i.sku})</span> × {i.quantity}
                  </span>
                  <span>{formatPrice(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
              <span className="text-sm text-muted">
                {PAYMENT_METHOD_LABELS[o.paymentMethod]}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-bold">{formatPrice(o.total)}</span>
                <form action={setOrderStatusAction} className="flex items-center gap-2">
                  <input type="hidden" name="orderNumber" value={o.orderNumber} />
                  <select
                    name="status"
                    defaultValue={o.status}
                    className="rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {ORDER_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                  <button className="rounded-lg bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent-dark hover:bg-accent hover:text-white">
                    Сохранить
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

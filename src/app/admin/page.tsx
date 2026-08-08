import Link from "next/link";
import { requireAdmin } from "@/lib/adminAuth";
import { getProducts } from "@/lib/catalog";
import { getAllOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/site";
import { deleteProductAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = getProducts({ sort: "new" });
  const orders = getAllOrders();
  const newOrders = orders.filter((o) => o.status === "new").length;

  return (
    <div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5">
          <div className="text-sm text-muted">Товаров</div>
          <div className="text-2xl font-bold">{products.length}</div>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <div className="text-sm text-muted">Заказов всего</div>
          <div className="text-2xl font-bold">{orders.length}</div>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <div className="text-sm text-muted">Новых заказов</div>
          <div className="text-2xl font-bold text-accent">{newOrders}</div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Товары</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
        >
          + Добавить товар
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b bg-background/60 text-left text-muted">
            <tr>
              <th className="px-4 py-3">Артикул</th>
              <th className="px-4 py-3">Название</th>
              <th className="px-4 py-3">Категория</th>
              <th className="px-4 py-3 text-right">Цена</th>
              <th className="px-4 py-3 text-right">Остаток</th>
              <th className="px-4 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="px-4 py-3 text-muted">{p.sku}</td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-muted">{p.categoryName}</td>
                <td className="px-4 py-3 text-right">
                  {formatPrice(p.price)}
                  {p.oldPrice && (
                    <span className="ml-1 text-xs text-muted line-through">
                      {formatPrice(p.oldPrice)}
                    </span>
                  )}
                </td>
                <td
                  className={`px-4 py-3 text-right ${
                    p.stock === 0 ? "text-accent" : ""
                  }`}
                >
                  {p.stock}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-accent hover:underline"
                    >
                      Изменить
                    </Link>
                    <form action={deleteProductAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="text-muted hover:text-accent">
                        Удалить
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import Link from "next/link";
import { requireAdmin } from "@/lib/adminAuth";
import { getProducts, type SortKey } from "@/lib/catalog";
import { getAllOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/site";
import { deleteProductAction } from "./actions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const SORTS: { key: SortKey; label: string }[] = [
  { key: "sku", label: "По артикулу" },
  { key: "name", label: "По названию (А–Я)" },
  { key: "price-asc", label: "По цене" },
  { key: "stock", label: "По остатку (мало→много)" },
  { key: "new", label: "Сначала новые" },
];

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const sort: SortKey = SORTS.some((s) => s.key === sp.sort)
    ? (sp.sort as SortKey)
    : "sku";
  const products = getProducts({ sort });
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

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Товары</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
        >
          + Добавить товар
        </Link>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted">Сортировка:</span>
        {SORTS.map((s) => (
          <Link
            key={s.key}
            href={`/admin?sort=${s.key}`}
            aria-current={sort === s.key ? "true" : undefined}
            className={`rounded-full px-3 py-1 transition-colors ${
              sort === s.key
                ? "bg-accent-soft font-medium text-accent-dark"
                : "text-muted hover:text-accent"
            }`}
          >
            {s.label}
          </Link>
        ))}
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
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-3">
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-background">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.image || "/products/accessories.svg"}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </span>
                    <span>{p.name}</span>
                  </div>
                </td>
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

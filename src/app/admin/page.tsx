import Link from "next/link";
import { requireAdmin } from "@/lib/adminAuth";
import { getProducts, type SortKey } from "@/lib/catalog";
import { getAllOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/site";
import { deleteProductAction } from "./actions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// Кликабельные столбцы: у каждого свои ключи сортировки ↑/↓.
const COLS = [
  { field: "sku", label: "Артикул", asc: "sku", desc: "sku-desc", right: false },
  { field: "name", label: "Название", asc: "name", desc: "name-desc", right: false },
  { field: "price", label: "Цена", asc: "price-asc", desc: "price-desc", right: true },
  { field: "stock", label: "Остаток", asc: "stock", desc: "stock-desc", right: true },
] as const satisfies readonly {
  field: string;
  label: string;
  asc: SortKey;
  desc: SortKey;
  right: boolean;
}[];

const ALL_SORT_KEYS: SortKey[] = COLS.flatMap((c) => [c.asc, c.desc]);

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const sort: SortKey =
    typeof sp.sort === "string" && ALL_SORT_KEYS.includes(sp.sort as SortKey)
      ? (sp.sort as SortKey)
      : "sku";

  // <th> с кликабельной сортировкой и стрелкой-индикатором направления.
  const sortHeader = (col: (typeof COLS)[number]) => {
    const active = sort === col.asc || sort === col.desc;
    const dir: "asc" | "desc" = sort === col.desc ? "desc" : "asc";
    const next = active && dir === "asc" ? col.desc : col.asc;
    return (
      <th
        key={col.field}
        aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
        className={`px-4 py-3 ${col.right ? "text-right" : ""}`}
      >
        <Link
          href={`/admin?sort=${next}`}
          title={`Сортировать по «${col.label}»`}
          className={`group inline-flex items-center gap-1 ${
            col.right ? "flex-row-reverse" : ""
          } ${active ? "text-accent-dark" : "hover:text-accent"}`}
        >
          <span className={active ? "font-semibold" : ""}>{col.label}</span>
          <span
            aria-hidden
            className={`text-[10px] leading-none ${
              active
                ? "text-accent"
                : "opacity-0 transition-opacity group-hover:opacity-40"
            }`}
          >
            {active ? (dir === "asc" ? "▲" : "▼") : "▲"}
          </span>
        </Link>
      </th>
    );
  };
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

      <p className="mb-3 text-xs text-muted">
        Клик по заголовку столбца сортирует по нему; повторный клик меняет
        направление (▲ по возрастанию / ▼ по убыванию).
      </p>

      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b bg-background/60 text-left text-muted">
            <tr>
              {sortHeader(COLS[0])}
              {sortHeader(COLS[1])}
              <th className="px-4 py-3">Категория</th>
              {sortHeader(COLS[2])}
              {sortHeader(COLS[3])}
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

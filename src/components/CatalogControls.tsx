"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { SortKey } from "@/lib/catalog";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "popular", label: "По популярности" },
  { value: "new", label: "Сначала новые" },
  { value: "price-asc", label: "Сначала дешёвые" },
  { value: "price-desc", label: "Сначала дорогие" },
];

export default function CatalogControls({
  bounds,
}: {
  bounds: { min: number; max: number };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function update(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === "") sp.delete(k);
      else sp.set(k, v);
    }
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <form
      className="flex flex-wrap items-end gap-4 rounded-2xl border bg-card p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        update({
          min: (fd.get("min") as string) || null,
          max: (fd.get("max") as string) || null,
        });
      }}
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">Цена, ₽</label>
        <div className="flex items-center gap-2">
          <input
            name="min"
            type="number"
            min={0}
            defaultValue={params.get("min") ?? ""}
            placeholder={String(bounds.min)}
            className="w-24 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <span className="text-muted">—</span>
          <input
            name="max"
            type="number"
            min={0}
            defaultValue={params.get("max") ?? ""}
            placeholder={String(bounds.max)}
            className="w-24 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-medium text-accent-dark hover:bg-accent hover:text-white"
          >
            ОК
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">Сортировка</label>
        <select
          defaultValue={params.get("sort") ?? "popular"}
          onChange={(e) => update({ sort: e.target.value })}
          className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {(params.get("min") || params.get("max") || params.get("q")) && (
        <button
          type="button"
          onClick={() => update({ min: null, max: null, q: null })}
          className="ml-auto text-sm text-muted underline hover:text-accent"
        >
          Сбросить фильтры
        </button>
      )}
    </form>
  );
}

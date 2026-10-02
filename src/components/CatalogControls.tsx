"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { SortKey } from "@/lib/catalog";
import { inputSmClass } from "./ui/Input";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "popular", label: "По популярности" },
  { value: "new", label: "Сначала новые" },
  { value: "price-asc", label: "Сначала дешёвые" },
  { value: "price-desc", label: "Сначала дорогие" },
];

const labelCls = "type-caption mb-2 block text-[11px] text-secondary";

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
      className="flex flex-wrap items-end gap-x-8 gap-y-5 border-y border-border py-6"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        update({
          min: (fd.get("min") as string) || null,
          max: (fd.get("max") as string) || null,
        });
      }}
    >
      <div>
        <label htmlFor="price-min" className={labelCls}>
          Цена, ₽
        </label>
        <div className="flex items-center gap-2">
          <input
            id="price-min"
            name="min"
            type="number"
            min={0}
            defaultValue={params.get("min") ?? ""}
            placeholder={String(bounds.min)}
            aria-label="Цена от"
            className={`${inputSmClass} w-28`}
          />
          <span className="type-small text-secondary" aria-hidden>
            до
          </span>
          <input
            name="max"
            type="number"
            min={0}
            defaultValue={params.get("max") ?? ""}
            placeholder={String(bounds.max)}
            aria-label="Цена до"
            className={`${inputSmClass} w-28`}
          />
          <button
            type="submit"
            className="type-button h-12 rounded-sm border border-[#d8cfc5] px-5 text-[14px] text-foreground transition ease-brand hover:bg-surface-alt"
          >
            ОК
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="sort" className={labelCls}>
          Сортировка
        </label>
        <select
          id="sort"
          defaultValue={params.get("sort") ?? "popular"}
          onChange={(e) => update({ sort: e.target.value })}
          className={`${inputSmClass} min-w-52`}
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
          className="link-underline type-small ml-auto pb-3 text-secondary transition-colors ease-brand hover:text-accent"
        >
          Сбросить фильтры
        </button>
      )}
    </form>
  );
}

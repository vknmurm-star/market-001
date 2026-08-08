import Link from "next/link";
import type { Category, Product } from "@/lib/types";

export default function ProductForm({
  categories,
  action,
  product,
}: {
  categories: Category[];
  action: (formData: FormData) => void;
  product?: Product;
}) {
  const inputClass =
    "w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent";

  return (
    <form action={action} className="max-w-2xl space-y-4 rounded-2xl border bg-card p-6">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Артикул (SKU) *</span>
          <input
            name="sku"
            required
            defaultValue={product?.sku}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Категория *</span>
          <select
            name="categoryId"
            required
            defaultValue={product?.categoryId}
            className={inputClass}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Название *</span>
        <input
          name="name"
          required
          defaultValue={product?.name}
          className={inputClass}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Цена, ₽ *</span>
          <input
            name="price"
            type="number"
            min={0}
            required
            defaultValue={product?.price}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Старая цена, ₽</span>
          <input
            name="oldPrice"
            type="number"
            min={0}
            defaultValue={product?.oldPrice ?? ""}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Остаток, шт *</span>
          <input
            name="stock"
            type="number"
            min={0}
            required
            defaultValue={product?.stock ?? 0}
            className={inputClass}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Описание</span>
        <textarea
          name="description"
          rows={4}
          defaultValue={product?.description}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">
          Путь к изображению
        </span>
        <input
          name="image"
          defaultValue={product?.image ?? ""}
          placeholder="/products/face-care.svg"
          className={inputClass}
        />
        <span className="mt-1 block text-xs text-muted">
          Оставьте пустым — подставится заглушка по категории.
        </span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="rounded-full bg-accent px-6 py-2.5 font-semibold text-white hover:bg-accent-dark"
        >
          Сохранить
        </button>
        <Link href="/admin" className="text-sm text-muted hover:text-accent">
          Отмена
        </Link>
      </div>
    </form>
  );
}

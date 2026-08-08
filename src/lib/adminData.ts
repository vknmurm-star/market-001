import { getDb } from "./db";
import { slugify } from "./slug";
import type { Category } from "./types";

export interface ProductInput {
  sku: string;
  name: string;
  categoryId: number;
  price: number;
  oldPrice: number | null;
  description: string;
  stock: number;
  image?: string | null;
}

function uniqueSlug(base: string, excludeId?: number): string {
  const db = getDb();
  let slug = slugify(base) || `p-${Date.now()}`;
  let candidate = slug;
  let n = 2;
  const check = db.prepare(
    `SELECT id FROM products WHERE slug = ? AND id != ?`,
  );
  while (check.get(candidate, excludeId ?? -1)) {
    candidate = `${slug}-${n++}`;
  }
  return candidate;
}

export function createProduct(input: ProductInput): number {
  const db = getDb();
  const category = db
    .prepare(`SELECT slug FROM categories WHERE id = ?`)
    .get(input.categoryId) as unknown as { slug: string } | undefined;

  const res = db
    .prepare(
      `INSERT INTO products
         (sku, slug, name, category_id, price, old_price, description, stock, image, popularity)
       VALUES (@sku, @slug, @name, @categoryId, @price, @oldPrice, @description, @stock, @image, 0)`,
    )
    .run({
      sku: input.sku,
      slug: uniqueSlug(input.name),
      name: input.name,
      categoryId: input.categoryId,
      price: input.price,
      oldPrice: input.oldPrice,
      description: input.description,
      stock: input.stock,
      image: input.image ?? (category ? `/products/${category.slug}.svg` : null),
    });
  return Number(res.lastInsertRowid);
}

export function updateProduct(id: number, input: ProductInput): void {
  const db = getDb();
  db.prepare(
    `UPDATE products SET
       sku = @sku, name = @name, category_id = @categoryId, price = @price,
       old_price = @oldPrice, description = @description, stock = @stock,
       slug = @slug, image = @image
     WHERE id = @id`,
  ).run({
    id,
    sku: input.sku,
    name: input.name,
    categoryId: input.categoryId,
    price: input.price,
    oldPrice: input.oldPrice,
    description: input.description,
    stock: input.stock,
    slug: uniqueSlug(input.name, id),
    image: input.image ?? null,
  });
}

export function deleteProduct(id: number): void {
  getDb().prepare(`DELETE FROM products WHERE id = ?`).run(id);
}

export function getCategoriesRaw(): Category[] {
  const rows = getDb()
    .prepare(`SELECT * FROM categories ORDER BY sort ASC`)
    .all() as unknown as Category[];
  return rows.map((r) => ({ id: r.id, slug: r.slug, name: r.name, sort: r.sort }));
}

import fs from "node:fs";
import path from "node:path";
import { getDb } from "./db";
import { slugify } from "./slug";
import type { Category } from "./types";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 МБ
export const MAX_PRODUCT_IMAGES = 4; // не больше 4 фото на товар

/**
 * Сохраняет загруженный файл изображения в public/uploads и возвращает его
 * публичный путь (/uploads/<файл>) или null, если файл не подходит (тип/размер).
 */
export async function saveUploadedImage(
  file: File,
  sku: string,
): Promise<string | null> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) return null;
  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) return null;

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const safe = sku.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase() || "product";
  // случайный суффикс — чтобы несколько файлов в одном запросе не столкнулись
  const rand = Math.random().toString(36).slice(2, 8);
  const name = `${safe}-${Date.now()}-${rand}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
  return `/uploads/${name}`;
}

const LOGO_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

/** Сохраняет логотип в public/uploads. Возвращает публичный путь или null. */
export async function saveLogoFile(file: File): Promise<string | null> {
  const ext = LOGO_TYPES[file.type];
  if (!ext) return null;
  if (file.size <= 0 || file.size > 2 * 1024 * 1024) return null; // до 2 МБ
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const name = `logo-${Date.now()}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

/** Удаляет файл из public/uploads по публичному пути (безопасно, без traversal). */
export function deleteUploadFile(p: string | null | undefined): void {
  if (!p || !p.startsWith("/uploads/")) return;
  const full = path.join(UPLOAD_DIR, p.slice("/uploads/".length));
  if (full !== UPLOAD_DIR && !full.startsWith(UPLOAD_DIR + path.sep)) return;
  try {
    if (fs.existsSync(full)) fs.unlinkSync(full);
  } catch {
    // файл мог быть уже удалён — не критично
  }
}

export interface ProductImage {
  id: number;
  path: string;
}

export function getProductImages(productId: number): ProductImage[] {
  const rows = getDb()
    .prepare(
      `SELECT id, path FROM product_images WHERE product_id = ? ORDER BY sort ASC, id ASC`,
    )
    .all(productId) as unknown as ProductImage[];
  // возвращаем plain-объекты (node:sqlite отдаёт null-prototype, а их нельзя
  // передавать в клиентские компоненты)
  return rows.map((r) => ({ id: r.id, path: r.path }));
}

export function addProductImage(productId: number, imgPath: string): void {
  const db = getDb();
  const max = db
    .prepare(
      `SELECT COALESCE(MAX(sort), -1) AS m FROM product_images WHERE product_id = ?`,
    )
    .get(productId) as unknown as { m: number };
  db.prepare(
    `INSERT INTO product_images (product_id, path, sort) VALUES (?, ?, ?)`,
  ).run(productId, imgPath, max.m + 1);
}

export function deleteProductImage(imageId: number): void {
  const db = getDb();
  const row = db
    .prepare(`SELECT path FROM product_images WHERE id = ?`)
    .get(imageId) as unknown as { path: string } | undefined;
  if (!row) return;
  db.prepare(`DELETE FROM product_images WHERE id = ?`).run(imageId);
  deleteUploadFile(row.path);
}

/** Применяет порядок изображений: sort = позиция в массиве orderedIds. */
export function reorderProductImages(
  productId: number,
  orderedIds: number[],
): void {
  const db = getDb();
  const upd = db.prepare(
    `UPDATE product_images SET sort = ? WHERE id = ? AND product_id = ?`,
  );
  orderedIds.forEach((id, i) => upd.run(i, id, productId));
}

export function countProductImages(productId: number): number {
  const row = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM product_images WHERE product_id = ?`)
    .get(productId) as unknown as { n: number };
  return row.n;
}

/** Ставит главным изображением товара первую картинку галереи (если она есть). */
export function syncMainImage(productId: number): void {
  const db = getDb();
  const first = db
    .prepare(
      `SELECT path FROM product_images WHERE product_id = ? ORDER BY sort ASC, id ASC LIMIT 1`,
    )
    .get(productId) as unknown as { path: string } | undefined;
  if (first) {
    db.prepare(`UPDATE products SET image = ? WHERE id = ?`).run(
      first.path,
      productId,
    );
  }
}

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
  // image не трогаем — им управляет галерея (product_images + syncMainImage),
  // чтобы правка полей не затирала картинку.
  db.prepare(
    `UPDATE products SET
       sku = @sku, name = @name, category_id = @categoryId, price = @price,
       old_price = @oldPrice, description = @description, stock = @stock,
       slug = @slug
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
  });
}

export function deleteProduct(id: number): void {
  const db = getDb();
  const main = db.prepare(`SELECT image FROM products WHERE id = ?`).get(id) as
    | unknown as { image: string | null }
    | undefined;
  const gallery = db
    .prepare(`SELECT path FROM product_images WHERE product_id = ?`)
    .all(id) as unknown as { path: string }[];
  db.prepare(`DELETE FROM products WHERE id = ?`).run(id); // CASCADE чистит product_images
  // подчищаем файлы с диска
  const paths = new Set<string>(gallery.map((g) => g.path));
  if (main?.image) paths.add(main.image);
  for (const p of paths) deleteUploadFile(p);
}

export function getCategoriesRaw(): Category[] {
  const rows = getDb()
    .prepare(`SELECT * FROM categories ORDER BY sort ASC`)
    .all() as unknown as Category[];
  return rows.map((r) => ({ id: r.id, slug: r.slug, name: r.name, sort: r.sort }));
}

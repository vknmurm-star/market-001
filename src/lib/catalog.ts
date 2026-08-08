import { getDb } from "./db";
import type { Category, Product } from "./types";

interface ProductRow {
  id: number;
  sku: string;
  slug: string;
  name: string;
  category_id: number;
  category_slug: string;
  category_name: string;
  price: number;
  old_price: number | null;
  description: string;
  stock: number;
  image: string | null;
  popularity: number;
  created_at: string;
}

function mapProduct(r: ProductRow): Product {
  return {
    id: r.id,
    sku: r.sku,
    slug: r.slug,
    name: r.name,
    categoryId: r.category_id,
    categorySlug: r.category_slug,
    categoryName: r.category_name,
    price: r.price,
    oldPrice: r.old_price,
    description: r.description,
    stock: r.stock,
    image: r.image,
    popularity: r.popularity,
    createdAt: r.created_at,
  };
}

const PRODUCT_SELECT = `
  SELECT p.*, c.slug AS category_slug, c.name AS category_name
  FROM products p
  JOIN categories c ON c.id = p.category_id
`;

function mapCategory(r: {
  id: number;
  slug: string;
  name: string;
  sort: number;
}): Category {
  return { id: r.id, slug: r.slug, name: r.name, sort: r.sort };
}

export function getCategories(): Category[] {
  const rows = getDb()
    .prepare(`SELECT * FROM categories ORDER BY sort ASC, name ASC`)
    .all() as unknown as Category[];
  return rows.map(mapCategory);
}

export function getCategoryBySlug(slug: string): Category | null {
  const row = getDb()
    .prepare(`SELECT * FROM categories WHERE slug = ?`)
    .get(slug) as unknown as Category | undefined;
  return row ? mapCategory(row) : null;
}

export type SortKey = "popular" | "price-asc" | "price-desc" | "new";

export interface ProductFilter {
  categorySlug?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortKey;
}

function orderClause(sort: SortKey | undefined): string {
  switch (sort) {
    case "price-asc":
      return "p.price ASC";
    case "price-desc":
      return "p.price DESC";
    case "new":
      return "p.created_at DESC, p.id DESC";
    case "popular":
    default:
      return "p.popularity DESC, p.id ASC";
  }
}

export function getProducts(filter: ProductFilter = {}): Product[] {
  const where: string[] = [];
  const params: Record<string, string | number> = {};

  if (filter.categorySlug) {
    where.push("c.slug = @categorySlug");
    params.categorySlug = filter.categorySlug;
  }
  if (filter.query && filter.query.trim()) {
    // Регистронезависимый поиск по вхождению (в т.ч. кириллица): понижаем
    // регистр в JS и через ulower() в SQL. Экранируем спецсимволы LIKE.
    const q = filter.query
      .trim()
      .toLowerCase()
      .replace(/[\\%_]/g, (m) => `\\${m}`);
    where.push(
      "(ulower(p.name) LIKE @q ESCAPE '\\' OR ulower(p.description) LIKE @q ESCAPE '\\')",
    );
    params.q = `%${q}%`;
  }
  if (typeof filter.minPrice === "number") {
    where.push("p.price >= @minPrice");
    params.minPrice = filter.minPrice;
  }
  if (typeof filter.maxPrice === "number") {
    where.push("p.price <= @maxPrice");
    params.maxPrice = filter.maxPrice;
  }

  const sql = `
    ${PRODUCT_SELECT}
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY ${orderClause(filter.sort)}
  `;

  return (getDb().prepare(sql).all(params) as unknown as ProductRow[]).map(
    mapProduct,
  );
}

export function getProductBySlug(slug: string): Product | null {
  const row = getDb()
    .prepare(`${PRODUCT_SELECT} WHERE p.slug = ?`)
    .get(slug) as unknown as ProductRow | undefined;
  return row ? mapProduct(row) : null;
}

export function getProductById(id: number): Product | null {
  const row = getDb()
    .prepare(`${PRODUCT_SELECT} WHERE p.id = ?`)
    .get(id) as unknown as ProductRow | undefined;
  return row ? mapProduct(row) : null;
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const rows = getDb()
    .prepare(
      `${PRODUCT_SELECT} WHERE p.category_id = ? AND p.id != ? ORDER BY p.popularity DESC LIMIT ?`,
    )
    .all(product.categoryId, product.id, limit) as unknown as ProductRow[];
  return rows.map(mapProduct);
}

export function getFeaturedProducts(limit = 8): Product[] {
  const rows = getDb()
    .prepare(`${PRODUCT_SELECT} ORDER BY p.popularity DESC LIMIT ?`)
    .all(limit) as unknown as ProductRow[];
  return rows.map(mapProduct);
}

export function getPriceBounds(): { min: number; max: number } {
  const row = getDb()
    .prepare(`SELECT MIN(price) AS min, MAX(price) AS max FROM products`)
    .get() as unknown as { min: number | null; max: number | null };
  return { min: row.min ?? 0, max: row.max ?? 0 };
}

export function getProductsByIds(ids: number[]): Product[] {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => "?").join(",");
  const rows = getDb()
    .prepare(`${PRODUCT_SELECT} WHERE p.id IN (${placeholders})`)
    .all(...ids) as unknown as ProductRow[];
  return rows.map(mapProduct);
}

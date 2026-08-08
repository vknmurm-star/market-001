/**
 * Ручной запуск сидирования: `npm run seed`.
 * Обычно не нужен — БД сама засевается при первом обращении приложения к ней
 * (см. getDb() в src/lib/db.ts), но скрипт полезен для проверки и
 * пересоздания данных с нуля. Самодостаточный: не импортирует src/lib,
 * чтобы работать напрямую под нативным TypeScript-раннером Node 24.
 */
import path from "node:path";
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";

const MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
  з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c",
  ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .split("")
    .map((ch) => (ch in MAP ? MAP[ch] : ch))
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

interface SeedProduct {
  sku: string;
  name: string;
  category: string;
  price: number;
  old_price?: number;
  description: string;
  stock: number;
}
interface SeedFile {
  categories: { slug: string; name: string }[];
  products: SeedProduct[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = process.env.DATABASE_PATH || path.join(DATA_DIR, "market.db");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, sort INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT NOT NULL UNIQUE, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    price INTEGER NOT NULL, old_price INTEGER, description TEXT NOT NULL DEFAULT '',
    stock INTEGER NOT NULL DEFAULT 0, image TEXT, popularity INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const seed = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "src", "data", "seed.json"), "utf-8"),
) as SeedFile;

const insertCategory = db.prepare(
  `INSERT OR IGNORE INTO categories (slug, name, sort) VALUES (?, ?, ?)`,
);
const getCategoryId = db.prepare(`SELECT id FROM categories WHERE slug = ?`);
const insertProduct = db.prepare(
  `INSERT OR IGNORE INTO products
     (sku, slug, name, category_id, price, old_price, description, stock, image, popularity)
   VALUES (@sku, @slug, @name, @categoryId, @price, @oldPrice, @description, @stock, @image, @popularity)`,
);

const usedSlugs = new Set<string>(
  (db.prepare(`SELECT slug FROM products`).all() as { slug: string }[]).map((r) => r.slug),
);

let added = 0;
db.exec("BEGIN");
seed.categories.forEach((cat, i) => insertCategory.run(cat.slug, cat.name, i));
seed.products.forEach((p, i) => {
  const cat = getCategoryId.get(p.category) as { id: number } | undefined;
  if (!cat) return;
  let slug = slugify(p.name) || p.sku.toLowerCase();
  let unique = slug;
  let n = 2;
  while (usedSlugs.has(unique)) unique = `${slug}-${n++}`;
  usedSlugs.add(unique);
  const res = insertProduct.run({
    sku: p.sku, slug: unique, name: p.name, categoryId: cat.id, price: p.price,
    oldPrice: p.old_price ?? null, description: p.description, stock: p.stock,
    image: `/products/${p.category}.svg`,
    popularity: p.stock + ((seed.products.length - i) % 7),
  });
  if (Number(res.changes) > 0) added++;
});
db.exec("COMMIT");

const total = (db.prepare(`SELECT COUNT(*) AS n FROM products`).get() as { n: number }).n;
const cats = (db.prepare(`SELECT COUNT(*) AS n FROM categories`).get() as { n: number }).n;
console.log(`Сидирование завершено: добавлено ${added} товаров.`);
console.log(`Всего в БД: ${total} товаров, ${cats} категорий.`);
db.close();

import path from "node:path";
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { slugify } from "./slug";

/**
 * Единая точка доступа к SQLite через встроенный модуль node:sqlite
 * (Node 22.5+/24 — не требует нативной сборки, в отличие от better-sqlite3).
 * База лежит в /data/market.db (вне git). При первом обращении схема
 * создаётся, и если товаров нет — БД засевается из src/data/seed.json
 * (24 товара, 6 категорий из demo-products.json).
 */

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = process.env.DATABASE_PATH || path.join(DATA_DIR, "market.db");

interface SeedCategory {
  slug: string;
  name: string;
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
  categories: SeedCategory[];
  products: SeedProduct[];
}

let db: DatabaseSync | null = null;

export function createSchema(database: DatabaseSync) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      slug  TEXT NOT NULL UNIQUE,
      name  TEXT NOT NULL,
      sort  INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS products (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      sku         TEXT NOT NULL UNIQUE,
      slug        TEXT NOT NULL UNIQUE,
      name        TEXT NOT NULL,
      category_id INTEGER NOT NULL REFERENCES categories(id),
      price       INTEGER NOT NULL,
      old_price   INTEGER,
      description TEXT NOT NULL DEFAULT '',
      stock       INTEGER NOT NULL DEFAULT 0,
      image       TEXT,
      popularity  INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT NOT NULL UNIQUE,
      name          TEXT NOT NULL DEFAULT '',
      password_hash TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number   TEXT NOT NULL UNIQUE,
      user_id        INTEGER REFERENCES users(id),
      customer_name  TEXT NOT NULL,
      phone          TEXT NOT NULL,
      email          TEXT NOT NULL,
      address        TEXT NOT NULL DEFAULT '',
      comment        TEXT NOT NULL DEFAULT '',
      payment_method TEXT NOT NULL DEFAULT 'cash',
      status         TEXT NOT NULL DEFAULT 'new',
      total          INTEGER NOT NULL DEFAULT 0,
      created_at     TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id),
      sku        TEXT NOT NULL,
      name       TEXT NOT NULL,
      price      INTEGER NOT NULL,
      quantity   INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used       INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
    CREATE INDEX IF NOT EXISTS idx_pwreset_token ON password_resets(token_hash);
  `);
}

/**
 * Лёгкие миграции для БД, созданных до появления новых колонок.
 * SQLite не умеет ADD COLUMN IF NOT EXISTS — проверяем через PRAGMA.
 */
export function migrateSchema(database: DatabaseSync) {
  const cols = database
    .prepare(`PRAGMA table_info(users)`)
    .all() as unknown as { name: string }[];
  if (!cols.some((c) => c.name === "password_hash")) {
    database.exec(`ALTER TABLE users ADD COLUMN password_hash TEXT`);
  }
}

/**
 * Засев БД из seed.json. Идемпотентно: пропускает уже существующие
 * категории/товары по slug/sku. Возвращает число добавленных товаров.
 */
export function seedDatabase(database: DatabaseSync): number {
  const seedPath = path.join(process.cwd(), "src", "data", "seed.json");
  const raw = fs.readFileSync(seedPath, "utf-8");
  const seed = JSON.parse(raw) as SeedFile;

  const insertCategory = database.prepare(
    `INSERT OR IGNORE INTO categories (slug, name, sort) VALUES (?, ?, ?)`,
  );
  const getCategoryId = database.prepare(
    `SELECT id FROM categories WHERE slug = ?`,
  );
  const insertProduct = database.prepare(
    `INSERT OR IGNORE INTO products
       (sku, slug, name, category_id, price, old_price, description, stock, image, popularity)
     VALUES (@sku, @slug, @name, @categoryId, @price, @oldPrice, @description, @stock, @image, @popularity)`,
  );

  const usedSlugs = new Set<string>(
    (
      database.prepare(`SELECT slug FROM products`).all() as unknown as {
        slug: string;
      }[]
    ).map((r) => r.slug),
  );

  let added = 0;
  database.exec("BEGIN");
  try {
    seed.categories.forEach((cat, i) => {
      insertCategory.run(cat.slug, cat.name, i);
    });

    seed.products.forEach((p, i) => {
      const cat = getCategoryId.get(p.category) as unknown as
        | { id: number }
        | undefined;
      if (!cat) return;

      let slug = slugify(p.name);
      if (!slug) slug = p.sku.toLowerCase();
      let unique = slug;
      let n = 2;
      while (usedSlugs.has(unique)) {
        unique = `${slug}-${n++}`;
      }
      usedSlugs.add(unique);

      const res = insertProduct.run({
        sku: p.sku,
        slug: unique,
        name: p.name,
        categoryId: cat.id,
        price: p.price,
        oldPrice: p.old_price ?? null,
        description: p.description,
        stock: p.stock,
        image: `/products/${p.sku}.svg`,
        popularity: p.stock + ((seed.products.length - i) % 7),
      });
      if (Number(res.changes) > 0) added++;
    });

    database.exec("COMMIT");
  } catch (err) {
    database.exec("ROLLBACK");
    throw err;
  }

  return added;
}

export function getDb(): DatabaseSync {
  if (db) return db;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");
  createSchema(db);
  migrateSchema(db);

  const count = db.prepare(`SELECT COUNT(*) AS n FROM products`).get() as unknown as {
    n: number;
  };
  if (count.n === 0) {
    seedDatabase(db);
  }

  return db;
}

import fs from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "public", "images", "design");

const LEGACY_CATEGORIES = path.join(process.cwd(), "public", "images", "categories");

/**
 * Фото категории: новое public/images/design/category-<slug>.* либо прежнее
 * public/images/categories/<slug>.* — пока новое не сгенерировано.
 */
export function categoryPhoto(slug: string): string | null {
  const fresh = designImage(`category-${slug}`);
  if (fresh) return fresh;
  for (const ext of ["jpg", "png", "webp"]) {
    if (fs.existsSync(path.join(LEGACY_CATEGORIES, `${slug}.${ext}`))) {
      return `/images/categories/${slug}.${ext}`;
    }
  }
  return null;
}

/**
 * Путь к редакционному фото из public/images/design/<name>.{webp,jpg,png},
 * либо null, если файла (ещё) нет — страницы тогда рисуют аккуратную
 * заглушку вместо битой картинки. Только для серверных компонентов.
 */
export function designImage(name: string): string | null {
  for (const ext of ["webp", "jpg", "png"]) {
    if (fs.existsSync(path.join(DIR, `${name}.${ext}`))) {
      return `/images/design/${name}.${ext}`;
    }
  }
  return null;
}

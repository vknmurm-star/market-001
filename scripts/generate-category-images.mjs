/**
 * Генерация обложек КАТЕГОРИЙ через fal.ai по промптам из PHOTO_PROMPTS.md
 * (секция «Промпты по категориям»). Модель по умолчанию — flux-pro/v1.1.
 * Сохраняет в public/images/categories/<slug>.<ext>.
 *
 * Запуск (ключ из окружения, в коде не хранится):
 *   FAL_KEY=xxxxx node scripts/generate-category-images.mjs
 *
 * Переменные окружения:
 *   FAL_KEY     — обязателен
 *   FAL_MODEL   — по умолчанию fal-ai/flux-pro/v1.1
 *   IMAGE_SIZE  — по умолчанию square_hd
 *   FORCE=1     — перегенерировать существующие
 *   DRY_RUN=1   — показать промпты без API и без ключа
 *   ONLY=makeup,perfume — только указанные категории (slug)
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public", "images", "categories");
const MD_PATH = path.join(ROOT, "PHOTO_PROMPTS.md");

const MODEL = process.env.FAL_MODEL || "fal-ai/flux-pro/v1.1";
const IMAGE_SIZE = process.env.IMAGE_SIZE || "square_hd";
const FORCE = process.env.FORCE === "1";
const DRY_RUN = process.env.DRY_RUN === "1";
const ONLY = (process.env.ONLY || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

const STYLE =
  "professional product photography, flat lay composition, clean seamless " +
  "studio background, soft diffused lighting, gentle soft shadows, high detail, " +
  "photorealistic, square 1:1 composition, no text, no letters, no logos, " +
  "no brand names, plain unbranded generic packaging";

// ---------- Парсинг секции категорий ----------
function parseCategories(md) {
  const lines = md.split(/\r?\n/);
  const items = [];
  let inSection = false;
  for (const line of lines) {
    if (/^##\s+Промпты по категориям/i.test(line)) {
      inSection = true;
      continue;
    }
    if (inSection && /^##\s/.test(line)) break; // следующая секция
    if (!inSection) continue;
    const m = line.match(/^-\s+\*\*([a-z-]+)\*\*\s*[—–-]\s*(.+?)\s*$/);
    if (m) {
      const slug = m[1];
      const subject = m[2].trim();
      items.push({ slug, subject, prompt: `${subject}, ${STYLE}` });
    }
  }
  return items;
}

// ---------- fal ----------
function extFromContentType(ct) {
  if (!ct) return "jpg";
  if (ct.includes("png")) return "png";
  if (ct.includes("webp")) return "webp";
  return "jpg";
}

async function generateOne(prompt, falKey) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180_000);
  try {
    const res = await fetch(`https://fal.run/${MODEL}`, {
      method: "POST",
      headers: {
        Authorization: `Key ${falKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_size: IMAGE_SIZE,
        num_images: 1,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`fal ${res.status}: ${text.slice(0, 300)}`);
    }
    const data = await res.json();
    const img = data?.images?.[0];
    if (!img?.url) throw new Error(`нет image.url: ${JSON.stringify(data).slice(0, 300)}`);
    const imgRes = await fetch(img.url);
    if (!imgRes.ok) throw new Error(`скачивание ${imgRes.status}`);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    return { buf, ext: extFromContentType(img.content_type) };
  } finally {
    clearTimeout(timeout);
  }
}

// ---------- main ----------
const md = fs.readFileSync(MD_PATH, "utf-8");
let list = parseCategories(md);
if (ONLY.length) list = list.filter((i) => ONLY.includes(i.slug));

console.log(`Модель: ${MODEL} | размер: ${IMAGE_SIZE}`);
console.log(`Категорий распарсено: ${list.length}\n`);

if (DRY_RUN) {
  for (const it of list) console.log(`${it.slug}: ${it.prompt}`);
  console.log(`\nDRY_RUN — API не вызывался.`);
  process.exit(0);
}

const FAL_KEY = process.env.FAL_KEY || process.env.FAL_AI_KEY;
if (!FAL_KEY) {
  console.error("Задайте ключ: FAL_KEY=... node scripts/generate-category-images.mjs");
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

let ok = 0;
let skipped = 0;
const failed = [];

for (const it of list) {
  const existing = ["jpg", "png", "webp"].find((e) =>
    fs.existsSync(path.join(OUT_DIR, `${it.slug}.${e}`)),
  );
  if (existing && !FORCE) {
    console.log(`• ${it.slug} — уже есть, пропускаю`);
    skipped++;
    continue;
  }
  process.stdout.write(`→ ${it.slug} … `);
  let lastErr;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const { buf, ext } = await generateOne(it.prompt, FAL_KEY);
      fs.writeFileSync(path.join(OUT_DIR, `${it.slug}.${ext}`), buf);
      console.log(`ok (${(buf.length / 1024).toFixed(0)} КБ -> ${it.slug}.${ext})`);
      ok++;
      lastErr = null;
      break;
    } catch (e) {
      lastErr = e;
      if (attempt === 1) process.stdout.write("повтор… ");
    }
  }
  if (lastErr) {
    console.log(`ОШИБКА: ${lastErr.message}`);
    failed.push(it.slug);
  }
}

console.log(`\nГотово. Успешно: ${ok}, пропущено: ${skipped}, ошибок: ${failed.length}`);
if (failed.length) console.log(`Не удалось: ${failed.join(", ")}`);
console.log(`Файлы: public/images/categories/`);

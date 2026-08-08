/**
 * Генерация фото товаров через fal.ai (FLUX) по промптам из PHOTO_PROMPTS.md.
 * Сохраняет в public/images/products/<SKU>.<ext>.
 *
 * Запуск (токен НЕ хранится в коде — берётся из окружения):
 *   FAL_KEY=xxxxx node scripts/generate-images.mjs
 *
 * Полезные переменные окружения:
 *   FAL_KEY     — обязателен: ключ fal.ai (формат "id:secret" или просто ключ)
 *   FAL_MODEL   — модель, по умолчанию fal-ai/flux/dev
 *                 (быстрее/дешевле: fal-ai/flux/schnell; лучше: fal-ai/flux-pro/v1.1)
 *   IMAGE_SIZE  — по умолчанию square_hd (1024x1024)
 *   FORCE=1     — перегенерировать даже если файл уже есть
 *   DRY_RUN=1   — только распарсить и показать промпты, без вызовов API и без ключа
 *   ONLY=FC-001,MK-002  — сгенерировать только указанные SKU
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public", "images", "products");
const MD_PATH = path.join(ROOT, "PHOTO_PROMPTS.md");

const MODEL = process.env.FAL_MODEL || "fal-ai/flux/dev";
const IMAGE_SIZE = process.env.IMAGE_SIZE || "square_hd";
const FORCE = process.env.FORCE === "1";
const DRY_RUN = process.env.DRY_RUN === "1";
const ONLY = (process.env.ONLY || "")
  .split(",")
  .map((s) => s.trim().toUpperCase())
  .filter(Boolean);

// ---------- Парсинг PHOTO_PROMPTS.md ----------
function parsePrompts(md) {
  const lines = md.split(/\r?\n/);

  // Общий стиль: блок-цитата под "## Общий стиль"
  let style = "";
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+Общий стиль/i.test(lines[i])) {
      const buf = [];
      for (let j = i + 1; j < lines.length && !/^##\s/.test(lines[j]); j++) {
        const m = lines[j].match(/^>\s?(.*)$/);
        if (m) buf.push(m[1]);
      }
      style = buf.join(" ").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
      break;
    }
  }
  if (!style) throw new Error("Не нашёл блок «Общий стиль» в PHOTO_PROMPTS.md");

  // Товары: секции ### <cat> (<bg> фон) + строки - **SKU** — subject
  const items = [];
  let bg = "";
  for (const line of lines) {
    const head = line.match(/^###\s+.*\(([^)]+)\)/);
    if (head) {
      bg = head[1].replace(/\s*фон\s*$/i, "").trim(); // "blush pink фон" -> "blush pink"
      continue;
    }
    const item = line.match(/^-\s+\*\*([A-Z]{2}-\d{3})\*\*\s*[—–-]\s*(.+?)\s*$/);
    if (item) {
      const sku = item[1];
      const subject = item[2].trim();
      const prompt = [subject, bg ? `${bg} background` : "", style]
        .filter(Boolean)
        .join(", ");
      items.push({ sku, subject, bg, prompt });
    }
  }
  return { style, items };
}

// ---------- Вызов fal.ai ----------
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
        enable_safety_checker: true,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`fal ${res.status}: ${text.slice(0, 300)}`);
    }
    const data = await res.json();
    const img = data?.images?.[0];
    if (!img?.url) throw new Error(`нет image.url в ответе: ${JSON.stringify(data).slice(0, 300)}`);
    const imgRes = await fetch(img.url);
    if (!imgRes.ok) throw new Error(`скачивание изображения ${imgRes.status}`);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const ext = extFromContentType(img.content_type);
    return { buf, ext };
  } finally {
    clearTimeout(timeout);
  }
}

// ---------- main ----------
const md = fs.readFileSync(MD_PATH, "utf-8");
const { style, items } = parsePrompts(md);

let list = items;
if (ONLY.length) list = list.filter((i) => ONLY.includes(i.sku));

console.log(`Модель: ${MODEL} | размер: ${IMAGE_SIZE}`);
console.log(`Распарсено промптов: ${items.length}${ONLY.length ? ` (фильтр ONLY -> ${list.length})` : ""}`);
console.log(`Общий стиль: ${style.slice(0, 80)}…\n`);

if (items.length !== 24 && !ONLY.length) {
  console.warn(`⚠ Ожидалось 24 промпта, распарсено ${items.length} — проверьте формат PHOTO_PROMPTS.md`);
}

if (DRY_RUN) {
  for (const it of list) console.log(`${it.sku}: ${it.prompt}`);
  console.log(`\nDRY_RUN — API не вызывался. Файлы не создавались.`);
  process.exit(0);
}

const FAL_KEY = process.env.FAL_KEY || process.env.FAL_AI_KEY;
if (!FAL_KEY) {
  console.error("Задайте ключ: FAL_KEY=... node scripts/generate-images.mjs");
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

let ok = 0;
let skipped = 0;
const failed = [];

for (const it of list) {
  const existing = ["jpg", "png", "webp"].find((e) =>
    fs.existsSync(path.join(OUT_DIR, `${it.sku}.${e}`)),
  );
  if (existing && !FORCE) {
    console.log(`• ${it.sku} — уже есть (${it.sku}.${existing}), пропускаю`);
    skipped++;
    continue;
  }

  process.stdout.write(`→ ${it.sku} … `);
  let lastErr;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const { buf, ext } = await generateOne(it.prompt, FAL_KEY);
      const dest = path.join(OUT_DIR, `${it.sku}.${ext}`);
      fs.writeFileSync(dest, buf);
      console.log(`ok (${(buf.length / 1024).toFixed(0)} КБ -> ${it.sku}.${ext})`);
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
    failed.push(it.sku);
  }
}

console.log(`\nГотово. Успешно: ${ok}, пропущено: ${skipped}, ошибок: ${failed.length}`);
if (failed.length) console.log(`Не удалось: ${failed.join(", ")}`);
console.log(`Файлы: public/images/products/`);

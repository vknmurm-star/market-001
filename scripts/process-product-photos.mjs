/**
 * Подготовка главных фото товаров из design/products-new/<артикул>.png в
 * public/images/products/<артикул>.jpg (пути в БД не меняются).
 *
 * Все фото приводятся к 4:5 (1024×1280): это ровно рамка карточки каталога,
 * корзины и главного фото на странице товара, поэтому ничего не обрезается
 * дополнительно. Исходники двух форматов:
 *   - вертикальные 1024×1536: берём полную ширину и окно высотой 1280 по
 *     центру товара (cy, доля высоты);
 *   - квадратные 1254×1254: берём полную высоту и окно шириной 1003 по
 *     центру товара (cx, доля ширины), затем масштабируем до 1024×1280.
 * Центры товаров подобраны вручную по исходникам (товар целиком с запасом).
 *
 * Цветокоррекция (одинаковая для всех 24 фото): лёгкое осветление, насыщенность
 * примерно на 18% ниже и сдвиг баланса от оранжевого к нейтрально-тёплому
 * (чуть меньше красного, чуть больше синего), чтобы карточки были ближе к
 * светлым кремовым тонам макета. Цвет самого товара остаётся узнаваемым.
 *
 * Запуск:  node scripts/process-product-photos.mjs
 *   DRY_RUN=1  — только показать окна кадрирования, ничего не писать
 *   OUT=dir    — писать не в public/images/products, а в другую папку
 *   BRIGHTNESS, SATURATION, WB_R, WB_B — подстройка коррекции (по умолчанию
 *   значения ниже; BRIGHTNESS=1 SATURATION=1 WB_R=1 WB_B=1 даёт фото без правок)
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = path.join(process.cwd(), "design", "products-new");
const OUT = process.env.OUT || path.join(process.cwd(), "public", "images", "products");
const DRY = process.env.DRY_RUN === "1";
// Цветокоррекция
const BRIGHTNESS = Number(process.env.BRIGHTNESS ?? 1.06); // чуть светлее
const SATURATION = Number(process.env.SATURATION ?? 0.82); // −18%
const WB_R = Number(process.env.WB_R ?? 0.97); // меньше красного/оранжевого
const WB_B = Number(process.env.WB_B ?? 1.06); // чуть больше синего (нейтральнее)
const W = 1024;
const H = 1280; // 4:5

/** cy — центр товара по вертикали (портрет), cx — по горизонтали (квадрат). */
const CENTER = {
  "AC-001": { cy: 0.55 },
  "AC-002": { cy: 0.465 },
  "AC-003": { cy: 0.49 },
  "BC-001": { cy: 0.44 },
  "BC-002": { cy: 0.565 },
  "BC-003": { cy: 0.475 },
  "BC-004": { cy: 0.49 },
  "FC-001": { cy: 0.595 },
  "FC-002": { cy: 0.5 },
  "FC-003": { cy: 0.475 },
  "FC-004": { cy: 0.575 },
  "FC-005": { cy: 0.5 },
  "HC-001": { cy: 0.505 },
  "HC-003": { cy: 0.48 },
  "HC-002": { cx: 0.5 },
  "HC-004": { cx: 0.52 },
  "MK-001": { cx: 0.5 },
  "MK-002": { cx: 0.48 },
  "MK-003": { cx: 0.506 },
  "MK-004": { cx: 0.55 },
  "MK-005": { cx: 0.47 },
  "PF-001": { cx: 0.5 },
  "PF-002": { cx: 0.5 },
  "PF-003": { cx: 0.52 },
};

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
if (!DRY) fs.mkdirSync(OUT, { recursive: true });

let n = 0;
for (const file of fs.readdirSync(SRC).filter((f) => f.endsWith(".png")).sort()) {
  const sku = file.replace(/\.png$/, "");
  const c = CENTER[sku];
  if (!c) throw new Error(`нет центра для ${sku}`);
  const img = sharp(path.join(SRC, file));
  const { width, height } = await img.metadata();

  // окно 4:5 максимального размера внутри исходника
  let w = width;
  let h = Math.round((width * 5) / 4);
  if (h > height) {
    h = height;
    w = Math.round((height * 4) / 5);
  }
  const left = c.cx != null ? clamp(Math.round(c.cx * width - w / 2), 0, width - w) : Math.round((width - w) / 2);
  const top = c.cy != null ? clamp(Math.round(c.cy * height - h / 2), 0, height - h) : Math.round((height - h) / 2);
  console.log(`${sku}: ${width}×${height} → окно ${w}×${h} @ (${left},${top})`);
  if (DRY) continue;

  await img
    .extract({ left, top, width: w, height: h })
    .resize(W, H, { kernel: "lanczos3" })
    .modulate({ brightness: BRIGHTNESS, saturation: SATURATION })
    .linear([WB_R, 1, WB_B], [0, 0, 0])
    .jpeg({ quality: 92, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toFile(path.join(OUT, `${sku}.jpg`));
  n++;
}
console.log(DRY ? "DRY_RUN: файлы не записаны" : `записано ${n} файлов в ${path.relative(process.cwd(), OUT)}`);

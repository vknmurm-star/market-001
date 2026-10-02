/**
 * Генерация фотографий для премиального редизайна (hero, категории, «Ритуал
 * ухода», «Больше, чем косметика», финальный баннер) через fal.ai flux-pro/v1.1
 * в стиле design/DESIGN.md §6 («Quiet Luxury Beauty Editorial»).
 * Результат: public/images/design/<name>.webp (sharp, quality 82).
 * Имена файлов подхватывает src/lib/designImages.ts — править код не нужно.
 *
 * Запуск (ключ — только из окружения, в коде не хранится):
 *   FAL_KEY=xxxxx node scripts/generate-design-images.mjs
 *
 * Переменные окружения:
 *   FAL_KEY    — обязателен (кроме DRY_RUN)
 *   FAL_MODEL  — по умолчанию fal-ai/flux-pro/v1.1
 *   DRY_RUN=1  — показать список, размеры и промпты, без API и без ключа
 *   FORCE=1    — перегенерировать существующие
 *   ONLY=hero,category-makeup — только указанные имена
 *   MARKDOWN=1 — напечатать список с промптами в Markdown (для design/IMAGES.md)
 *   TRIALS=1   — вместо сайта сгенерировать 2 пробных варианта фото товара
 *                в новом стиле → design/trials/ (в public НЕ попадают)
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public", "images", "design");
const TRIAL_DIR = path.join(ROOT, "design", "trials");

const MODEL = process.env.FAL_MODEL || "fal-ai/flux-pro/v1.1";
const FORCE = process.env.FORCE === "1";
const DRY_RUN = process.env.DRY_RUN === "1";
const TRIALS = process.env.TRIALS === "1";
const ONLY = (process.env.ONLY || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

// Общий стиль (DESIGN.md §6): мягкий дневной свет, тёплая нейтральная гамма,
// фактуры травертин / известняк / лён, без блеска и 3D.
const STYLE =
  "quiet luxury beauty editorial photography, soft natural daylight through a window, " +
  "morning sun, warm neutral color temperature 4500-5200K, natural soft shadows, " +
  "matte surfaces on travertine, light limestone and linen, ivory beige sand cream " +
  "warm stone palette with a touch of olive green, photorealistic, shot on 50mm lens, " +
  "shallow depth of field, no text, no letters, no logos, no brand names, unbranded packaging, " +
  "no gloss, no neon, no acid colors, no studio flash, no cold blue light, not a 3D render";

// Для кадров с людьми / кожей.
const PEOPLE =
  "natural skin texture with visible pores, slight facial asymmetry, a few flyaway hairs, " +
  "light film grain, minimal retouching, no mirrors, no reflections";

/** w/h кратны 32 (требование flux), максимум 1440. */
const IMAGES = [
  {
    name: "hero",
    w: 1440, h: 800, // ~16:9, на всю ширину; на мобильном кадрируется object-position
    use: "Главная, hero (full-bleed, текст слева — левая треть кадра спокойная, без деталей)",
    prompt:
      "close-up beauty portrait of a young woman with a sleek low bun, her fingertips lightly touching her cheek, " +
      "face on the right half of the frame, left third of the frame calm warm beige empty wall with soft window light, " +
      "bare shoulders in a cream linen top, serene expression, glowing healthy skin",
    people: true,
  },
  {
    name: "category-face-care",
    w: 1280, h: 960, // 4:3, карточки разной ширины, высота ~300px
    use: "Главная, карточка «Уход за лицом»",
    prompt:
      "still life flat lay of an unbranded frosted white glass cream jar and a matte dropper bottle on a travertine slab, " +
      "a folded linen cloth, a sprig of dried olive branch, soft window light shadows",
  },
  {
    name: "category-body-care",
    w: 1280, h: 960,
    use: "Главная, карточка «Уход за телом»",
    prompt:
      "still life of an unbranded amber glass pump bottle and a matte ceramic body butter jar on light limestone, " +
      "a natural linen towel, a wooden body brush, sunlit morning shadows",
  },
  {
    name: "category-hair-care",
    w: 1280, h: 960,
    use: "Главная, карточка «Уход за волосами»",
    prompt:
      "still life of two unbranded matte beige shampoo and conditioner bottles with a natural wooden comb " +
      "on a linen surface by a window, soft morning light, dried grass stems",
  },
  {
    name: "category-makeup",
    w: 1280, h: 960,
    use: "Главная, карточка «Макияж»",
    prompt:
      "still life of unbranded matte makeup products — a nude lipstick, a compact powder, a soft brush — " +
      "arranged on a warm stone surface with a linen cloth, soft diffused daylight",
  },
  {
    name: "category-perfume",
    w: 1280, h: 960,
    use: "Главная, карточка «Парфюмерия»",
    prompt:
      "still life of an unbranded minimal frosted milk glass perfume bottle with a matte cap on a travertine plinth, " +
      "a dried flower, window light casting long soft shadows on plaster wall",
  },
  {
    name: "category-accessories",
    w: 1280, h: 960,
    use: "Главная, карточка «Аксессуары для красоты»",
    prompt:
      "still life of beauty accessories — a rose quartz face roller, a wooden gua sha, a linen pouch, a bamboo brush — " +
      "on a limestone surface, soft daylight",
  },
  {
    name: "ritual-banner",
    w: 1440, h: 640,
    use: "Главная, фон блока «Ритуал ухода» (справа спокойный кадр, слева — текст)",
    prompt:
      "wide calm bathroom shelf scene: white ceramic bowl of water with a floating flower, folded linen towels, " +
      "unbranded matte bottles on a travertine surface, matte plaster wall, sunlight stripe from the window on the right, " +
      "left side of frame soft and empty",
  },
  {
    name: "ritual-1",
    w: 768, h: 960, // 4:5
    use: "«Ритуал ухода», шаг 01 (очищение)",
    prompt:
      "close-up of a clear unbranded cleansing bottle and a cotton pad on a wet travertine tray, " +
      "water droplets, soft morning light, linen background",
  },
  {
    name: "ritual-2",
    w: 768, h: 960,
    use: "«Ритуал ухода», шаг 02 (активный уход)",
    prompt:
      "close-up of an unbranded amber glass dropper bottle with a single golden drop, resting on a light limestone block, " +
      "ivory linen behind, warm window light",
  },
  {
    name: "ritual-3",
    w: 768, h: 960,
    use: "«Ритуал ухода», шаг 03 (увлажнение; руки с кремом)",
    prompt:
      "close-up of a woman's hands gently smoothing cream, an open unbranded matte white cream jar on a linen cloth, " +
      "soft daylight, cropped without face",
    people: true,
  },
  {
    name: "values-1",
    w: 896, h: 1344, // 2:3, высокая плитка слева
    use: "«Больше, чем косметика», большая плитка «Внимание к деталям»",
    prompt:
      "tall composition: an unbranded dropper bottle and a matte cream jar among dried flowers and eucalyptus on a travertine pedestal, " +
      "soft sunlight, plaster wall, shadows of leaves",
  },
  {
    name: "values-2",
    w: 960, h: 720, // 4:3
    use: "«Больше, чем косметика», плитка «Спокойный ритуал»",
    prompt:
      "cozy morning corner: ceramic cup of tea, an open linen robe, matte skincare bottles on a wooden tray by the window, soft sunlight",
  },
  {
    name: "values-3",
    w: 960, h: 720,
    use: "«Больше, чем косметика», плитка «Забота о себе»",
    prompt:
      "a woman from behind in a cream linen robe holding a ceramic mug near a sunlit window, face not visible, " +
      "soft glow, warm beige interior",
    people: true,
  },
  {
    name: "cta-banner",
    w: 1440, h: 576,
    use: "Главная, финальный баннер (справа спокойный кадр, слева — текст)",
    prompt:
      "wide still life: unbranded matte skincare bottles and a dried olive branch on a travertine surface, " +
      "left half of the frame calm warm beige plaster wall, soft sunlight from the right",
  },
];

// Пробные варианты фото ТОВАРА в новом стиле (для согласования, не для сайта).
const TRIAL_IMAGES = [
  {
    name: "trial-product-1-travertine",
    w: 1024, h: 1280,
    use: "Пробник A: мицеллярная вода, травертин + утренний свет",
    prompt:
      "single unbranded clear plastic cleansing water bottle with a white cap, centered on a light travertine slab, " +
      "soft morning window light, gentle natural shadow, plain unbranded packaging",
  },
  {
    name: "trial-product-2-linen",
    w: 1024, h: 1280,
    use: "Пробник B: мицеллярная вода, лён + керамика",
    prompt:
      "single unbranded clear cleansing water bottle with a white cap on folded ivory linen next to a small white ceramic dish, " +
      "a dried flower stem, diffused daylight from the left, plain unbranded packaging",
  },
];

async function generate(item) {
  const prompt = `${item.prompt}, ${item.people ? PEOPLE + ", " : ""}${STYLE}`;
  const res = await fetch(`https://fal.run/${MODEL}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${process.env.FAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      image_size: { width: item.w, height: item.h },
      num_images: 1,
    }),
  });
  if (!res.ok) throw new Error(`fal.ai ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const url = data.images?.[0]?.url;
  if (!url) throw new Error("в ответе нет images[0].url");
  const img = await fetch(url);
  if (!img.ok) throw new Error(`скачивание ${img.status}`);
  return Buffer.from(await img.arrayBuffer());
}

const list = (TRIALS ? TRIAL_IMAGES : IMAGES).filter(
  (i) => ONLY.length === 0 || ONLY.includes(i.name),
);
const dir = TRIALS ? TRIAL_DIR : OUT_DIR;

if (process.env.MARKDOWN === "1") {
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const ratio = (w, h) => `${w / gcd(w, h)}:${h / gcd(w, h)}`;
  const fence = "```";
  console.log(`**Общий суффикс стиля** (добавляется к каждому промпту):\n\n${fence}text\n${STYLE}\n${fence}\n`);
  console.log(`**Дополнительно для кадров с людьми и кожей:**\n\n${fence}text\n${PEOPLE}\n${fence}\n`);
  for (const [title, arr] of [
    ["Для сайта → public/images/design/", IMAGES],
    ["Пробные фото товара → design/trials/", TRIAL_IMAGES],
  ]) {
    console.log(`\n## ${title}\n`);
    console.log("| Файл | Размер, px | Пропорции | Где используется |\n|---|---|---|---|");
    for (const i of arr) {
      console.log(`| \`${i.name}.webp\` | ${i.w}×${i.h} | ${ratio(i.w, i.h)} | ${i.use} |`);
    }
    console.log("");
    for (const i of arr) {
      console.log(`**${i.name}**${i.people ? " (человек)" : ""}\n\n${fence}text\n${i.prompt}\n${fence}\n`);
    }
  }
  process.exit(0);
}

if (DRY_RUN) {
  for (const i of list) {
    console.log(`\n# ${i.name}  ${i.w}×${i.h}  — ${i.use}`);
    console.log(`${i.prompt}, ${i.people ? PEOPLE + ", " : ""}${STYLE}`);
  }
  console.log(`\n${list.length} изображений → ${path.relative(ROOT, dir)} (DRY_RUN, API не вызывался)`);
  process.exit(0);
}

if (!process.env.FAL_KEY) {
  console.error("FAL_KEY не задан в окружении. Остановлено.");
  process.exit(1);
}

fs.mkdirSync(dir, { recursive: true });
let failed = 0;
for (const i of list) {
  const file = path.join(dir, `${i.name}.webp`);
  if (fs.existsSync(file) && !FORCE) {
    console.log(`– ${i.name}: уже есть (FORCE=1 для перегенерации)`);
    continue;
  }
  try {
    const buf = await generate(i);
    await sharp(buf).webp({ quality: 82 }).toFile(file);
    console.log(`✓ ${i.name} → ${path.relative(ROOT, file)} (${i.w}×${i.h})`);
  } catch (e) {
    failed++;
    console.error(`✗ ${i.name}: ${e.message}`);
  }
}
process.exit(failed ? 1 : 0);

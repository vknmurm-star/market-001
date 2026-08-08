// Генерация SVG-изображений товаров (без брендов/логотипов):
//  - по одному «обзорному» изображению на категорию (public/products/<slug>.svg)
//  - по одному уникальному изображению на КАЖДЫЙ товар (public/products/<sku>.svg),
//    чтобы каталог не выглядел как демо с повторяющейся картинкой.
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "products");
fs.mkdirSync(OUT, { recursive: true });

const seed = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "src", "data", "seed.json"), "utf-8"),
);

// Базовая палитра и «форма» упаковки по категории.
// shape: banka | tuba | flakon | bottle | palette | tool
const CAT = {
  "face-care": { hue: 330, name: "Уход за лицом", shape: "banka" },
  "body-care": { hue: 150, name: "Уход за телом", shape: "bottle" },
  "hair-care": { hue: 225, name: "Уход за волосами", shape: "bottle" },
  makeup: { hue: 20, name: "Макияж", shape: "tuba" },
  perfume: { hue: 275, name: "Парфюмерия", shape: "flakon" },
  accessories: { hue: 195, name: "Аксессуары", shape: "tool" },
};

function hsl(h, s, l) {
  return `hsl(${((h % 360) + 360) % 360} ${s}% ${l}%)`;
}

// Рисуем условную «упаковку» товара в центре 400x400.
function drawShape(shape, accent, accentDark) {
  switch (shape) {
    case "banka": // баночка крема
      return `
        <ellipse cx="200" cy="150" rx="70" ry="18" fill="${accent}"/>
        <rect x="130" y="150" width="140" height="110" rx="16" fill="${accent}"/>
        <ellipse cx="200" cy="150" rx="70" ry="18" fill="${accentDark}"/>
        <ellipse cx="200" cy="150" rx="52" ry="12" fill="#ffffff" opacity="0.35"/>`;
    case "tuba": // тюбик / помада
      return `
        <rect x="168" y="120" width="64" height="150" rx="10" fill="${accent}"/>
        <rect x="168" y="120" width="64" height="26" rx="10" fill="${accentDark}"/>
        <rect x="184" y="96" width="32" height="26" rx="6" fill="${accentDark}"/>
        <rect x="180" y="180" width="40" height="8" rx="4" fill="#ffffff" opacity="0.4"/>`;
    case "flakon": // флакон духов
      return `
        <rect x="164" y="150" width="72" height="100" rx="14" fill="${accent}"/>
        <rect x="186" y="120" width="28" height="34" fill="${accent}"/>
        <rect x="182" y="100" width="36" height="22" rx="5" fill="${accentDark}"/>
        <rect x="180" y="175" width="40" height="46" rx="8" fill="#ffffff" opacity="0.25"/>`;
    case "bottle": // бутылочка шампуня / геля
      return `
        <rect x="170" y="140" width="60" height="130" rx="18" fill="${accent}"/>
        <rect x="184" y="112" width="32" height="30" rx="8" fill="${accentDark}"/>
        <rect x="180" y="180" width="40" height="54" rx="8" fill="#ffffff" opacity="0.85"/>`;
    case "tool": // аксессуар (роллер/кисть)
      return `
        <rect x="192" y="120" width="16" height="150" rx="8" fill="${accentDark}"/>
        <ellipse cx="200" cy="120" rx="34" ry="22" fill="${accent}"/>
        <ellipse cx="200" cy="270" rx="20" ry="12" fill="${accent}"/>`;
    case "palette": // палетка
    default:
      return `
        <rect x="130" y="140" width="140" height="120" rx="14" fill="${accent}"/>
        <g fill="#ffffff" opacity="0.5">
          <circle cx="165" cy="175" r="14"/><circle cx="200" cy="175" r="14"/><circle cx="235" cy="175" r="14"/>
          <circle cx="165" cy="225" r="14"/><circle cx="200" cy="225" r="14"/><circle cx="235" cy="225" r="14"/>
        </g>`;
  }
}

// Второй ракурс товара — «текстура»/макро-свотч в оттенке товара (для галереи).
function swatchSvg({ hue, sat, label }) {
  const bg = hsl(hue, sat, 90);
  const c1 = hsl(hue, sat, 70);
  const c2 = hsl(hue, sat, 58);
  const c3 = hsl(hue, sat, 80);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img" aria-label="${label} — текстура">
  <rect width="400" height="400" fill="${bg}"/>
  <g opacity="0.85">
    <circle cx="120" cy="130" r="70" fill="${c1}"/>
    <circle cx="280" cy="110" r="52" fill="${c3}"/>
    <circle cx="300" cy="270" r="80" fill="${c2}"/>
    <circle cx="140" cy="300" r="58" fill="${c1}"/>
    <circle cx="210" cy="200" r="46" fill="${c3}"/>
  </g>
  <g fill="#ffffff" opacity="0.22">
    <circle cx="160" cy="170" r="10"/><circle cx="250" cy="150" r="7"/>
    <circle cx="300" cy="240" r="12"/><circle cx="120" cy="260" r="8"/>
    <circle cx="220" cy="300" r="9"/>
  </g>
</svg>
`;
}

function svg({ hue, sat, label, sub, shape }) {
  const bgTop = hsl(hue, 55, 94);
  const bgBottom = hsl(hue, 45, 86);
  const accent = hsl(hue, sat, 62);
  const accentDark = hsl(hue, sat, 48);
  const text = hsl(hue, 40, 32);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${bgTop}"/>
      <stop offset="1" stop-color="${bgBottom}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#g)"/>
  <circle cx="320" cy="80" r="60" fill="#ffffff" opacity="0.18"/>
  <circle cx="70" cy="330" r="42" fill="#ffffff" opacity="0.14"/>
  ${drawShape(shape, accent, accentDark)}
  ${sub ? `<text x="200" y="330" text-anchor="middle" font-family="system-ui, sans-serif" font-size="15" font-weight="600" fill="${text}">${sub}</text>` : ""}
</svg>
`;
}

// Разные «формы» товаров внутри категории — чтобы соседние карточки отличались.
const SHAPE_CYCLE = ["banka", "tuba", "flakon", "bottle", "palette", "tool"];

// 1) Обзорные картинки категорий.
for (const [slug, c] of Object.entries(CAT)) {
  fs.writeFileSync(
    path.join(OUT, `${slug}.svg`),
    svg({ hue: c.hue, sat: 58, label: c.name, sub: c.name, shape: c.shape }),
    "utf-8",
  );
  console.log(`✓ категория ${slug}.svg`);
}

// 2) Уникальная картинка под каждый товар: оттенок категории + сдвиг по индексу
//    товара в категории, форма упаковки чередуется.
const perCat = {};
for (const p of seed.products) {
  const c = CAT[p.category];
  const idx = (perCat[p.category] = (perCat[p.category] ?? 0) + 1) - 1;
  const hue = c.hue + (idx - 1.5) * 14; // разброс оттенков вокруг базового
  const sat = 52 + ((idx * 7) % 22);
  // короткая подпись — первое слово названия, чтобы картинка была «говорящей»
  const sub = p.name.split(" ").slice(0, 2).join(" ");
  const shape = SHAPE_CYCLE[(SHAPE_CYCLE.indexOf(c.shape) + idx) % SHAPE_CYCLE.length];
  fs.writeFileSync(
    path.join(OUT, `${p.sku}.svg`),
    svg({ hue, sat, label: p.name, sub, shape }),
    "utf-8",
  );
  // второй ракурс для галереи
  fs.writeFileSync(
    path.join(OUT, `${p.sku}-2.svg`),
    swatchSvg({ hue, sat, label: p.name }),
    "utf-8",
  );
}
console.log(`✓ товаров: ${seed.products.length} × 2 ракурса SVG`);
console.log("Готово.");

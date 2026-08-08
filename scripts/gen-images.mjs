// Генерация SVG-плейсхолдеров для категорий товаров (без брендов/логотипов).
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "products");
fs.mkdirSync(OUT, { recursive: true });

// [градиент-от, градиент-до, акцент, подпись, простой line-art motif path]
const CATS = {
  "face-care": ["#fde7f0", "#f6c9dd", "#c9497a", "Уход за лицом",
    `<circle cx="200" cy="180" r="70" fill="none" stroke="#c9497a" stroke-width="4"/>
     <path d="M170 175c8 12 52 12 60 0" fill="none" stroke="#c9497a" stroke-width="4" stroke-linecap="round"/>
     <circle cx="182" cy="160" r="4" fill="#c9497a"/><circle cx="218" cy="160" r="4" fill="#c9497a"/>`],
  "body-care": ["#e9f5ef", "#c5e7d6", "#2f7d55", "Уход за телом",
    `<rect x="170" y="120" width="60" height="120" rx="26" fill="none" stroke="#2f7d55" stroke-width="4"/>
     <rect x="182" y="100" width="36" height="26" rx="8" fill="#2f7d55"/>
     <path d="M182 170h36" stroke="#2f7d55" stroke-width="4" stroke-linecap="round"/>`],
  "hair-care": ["#eef0fb", "#cdd4f3", "#4a56b8", "Уход за волосами",
    `<path d="M150 120c30-30 70-30 100 0 20 20 20 90-10 130" fill="none" stroke="#4a56b8" stroke-width="4"/>
     <path d="M160 130c20 40 20 90 5 120" fill="none" stroke="#4a56b8" stroke-width="4"/>
     <path d="M200 120c10 50 6 100-8 128" fill="none" stroke="#4a56b8" stroke-width="4"/>`],
  "makeup": ["#fdeee6", "#f6cfba", "#c56a3a", "Макияж",
    `<rect x="185" y="120" width="30" height="90" rx="6" fill="none" stroke="#c56a3a" stroke-width="4"/>
     <rect x="180" y="210" width="40" height="30" rx="6" fill="#c56a3a"/>
     <path d="M200 120v-16" stroke="#c56a3a" stroke-width="4" stroke-linecap="round"/>`],
  "perfume": ["#f3ecfa", "#dcc9f0", "#7b4bb0", "Парфюмерия",
    `<rect x="172" y="150" width="56" height="90" rx="12" fill="none" stroke="#7b4bb0" stroke-width="4"/>
     <rect x="188" y="120" width="24" height="34" fill="none" stroke="#7b4bb0" stroke-width="4"/>
     <rect x="186" y="104" width="28" height="18" rx="4" fill="#7b4bb0"/>`],
  "accessories": ["#eaf3f7", "#c7e0ea", "#2f6f88", "Аксессуары",
    `<circle cx="200" cy="180" r="46" fill="none" stroke="#2f6f88" stroke-width="4"/>
     <path d="M200 134v92M154 180h92" stroke="#2f6f88" stroke-width="4" stroke-linecap="round"/>`],
};

for (const [slug, [c1, c2, accent, label, motif]] of Object.entries(CATS)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#g)"/>
  ${motif}
  <text x="200" y="320" text-anchor="middle" font-family="system-ui, sans-serif" font-size="22" font-weight="600" fill="${accent}">${label}</text>
</svg>
`;
  fs.writeFileSync(path.join(OUT, `${slug}.svg`), svg, "utf-8");
  console.log(`✓ ${slug}.svg`);
}
console.log("Готово: SVG-плейсхолдеры категорий сгенерированы.");

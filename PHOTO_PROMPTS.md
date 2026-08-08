# Промпты для генерации фото товаров (Gemini / аналог)

Сейчас в каталоге — стилизованные SVG-плейсхолдеры. Чтобы заменить их реальными
фото, сгенерируйте по 1–2 изображения на товар и подключите по инструкции внизу.

## Общий стиль (добавлять в КАЖДЫЙ промпт)

> professional product photography, single product centered, clean seamless
> studio background, soft diffused lighting, gentle soft shadow, high detail,
> photorealistic, square 1:1 composition — **no text, no letters, no logos, no
> brand names, plain unbranded generic packaging**

Важно: явно запрещаем текст/логотипы/бренды — иначе на упаковке появятся
несуществующие «бренды», и это проблема для публичного кейса (авторские права).

## Фон по категориям (для единообразия витрины)

- Уход за лицом — нежно-розовый фон (blush pink)
- Уход за телом — мятно-зелёный фон (soft mint)
- Уход за волосами — прохладный сине-сиреневый фон (soft periwinkle)
- Макияж — тёплый персиковый фон (warm peach)
- Парфюмерия — лавандово-сиреневый фон (soft lavender)
- Аксессуары — светло-голубой фон (soft sky blue)

## Промпты по товарам (subject + фон + общий стиль)

### Уход за лицом (blush pink фон)
- **FC-001** — a jar of face cream with hyaluronic acid, glossy white jar
- **FC-002** — a dropper serum bottle, vitamin C serum, amber glass with pipette
- **FC-003** — a bottle of micellar cleansing water, clear liquid, transparent bottle
- **FC-004** — a jar of night retinol mask, matte dark violet jar
- **FC-005** — an eye cream tube with a metal applicator tip, small pastel tube

### Уход за телом (soft mint фон)
- **BC-001** — a bottle of almond body oil, warm golden oil in glass bottle
- **BC-002** — an open jar of coffee body scrub, brown granular texture
- **BC-003** — a hand cream tube, small soft green tube
- **BC-004** — a bottle of aloe vera shower gel, translucent green gel

### Уход за волосами (soft periwinkle фон)
- **HC-001** — a shampoo bottle for colored hair, sleek pastel bottle
- **HC-002** — a jar of restorative hair mask, creamy white jar
- **HC-003** — a leave-in hair spray bottle with trigger sprayer
- **HC-004** — a small bottle of hair ends oil, thin glass bottle with dropper

### Макияж (warm peach фон)
- **MK-001** — a foundation bottle with pump, SPF tinted liquid, frosted glass
- **MK-002** — a mascara tube, black glossy tube with wand cap
- **MK-003** — an open eyeshadow palette, 12 neutral matte and shimmer shades
- **MK-004** — a matte lipstick, uncapped bullet, muted rose shade
- **MK-005** — a liquid concealer with applicator, small tube

### Парфюмерия (soft lavender фон)
- **PF-001** — a women's floral eau de parfum, elegant faceted glass flacon 50ml
- **PF-002** — a unisex woody eau de toilette, minimalist rectangular flacon
- **PF-003** — a travel set of three mini perfume vials, 15ml each, in a row

### Аксессуары (soft sky blue фон)
- **AC-001** — a fabric cosmetic pouch with zipper, soft neutral color
- **AC-002** — a set of 8 makeup brushes fanned out with a storage case
- **AC-003** — a rose quartz facial roller, pale pink natural stone

## Промпты по категориям (обложки витрины)

Тот же студийный стиль, но композиция — аккуратная раскладка нескольких товаров
категории (flat lay), а не один предмет. Скрипт `generate-category-images.mjs`
парсит строки ниже (`**<slug>** — <subject>`) и добавляет общий стиль:
`professional product photography, flat lay composition, clean seamless studio
background, soft diffused lighting, gentle soft shadows, high detail,
photorealistic, square 1:1 composition, no text, no letters, no logos, no brand
names, plain unbranded generic packaging`.

- **face-care** — an elegant flat lay of facial skincare products — a white cream jar, an amber serum dropper bottle and a pastel tube — on a soft blush pink background
- **body-care** — an elegant flat lay of body care products — a glass body oil bottle, an open scrub jar and a hand cream tube — on a soft mint green background
- **hair-care** — an elegant flat lay of hair care products — a shampoo bottle, a hair mask jar and a spray bottle — on a soft periwinkle blue background
- **makeup** — an elegant flat lay of makeup products — a foundation bottle, a mascara, an open eyeshadow palette and a lipstick — on a warm peach background
- **perfume** — an elegant arrangement of several perfume glass flacons of different shapes — on a soft lavender background
- **accessories** — an elegant flat lay of beauty accessories — a set of makeup brushes, a cosmetic pouch and a rose quartz facial roller — on a soft sky blue background

Сохраняются в `public/images/categories/<slug>.jpg`. Главная сама подставит их
вместо SVG-заглушек, если файлы есть.

## Как подключить сгенерированные фото

1. Сохраните файлы в `public/products/` как `<SKU>.jpg` (основной ракурс) и,
   если делаете второй кадр, `<SKU>-2.jpg` (например `FC-001.jpg`,
   `FC-001-2.jpg`). Галерея на карточке сама подставит `-2` перед расширением.
2. Обновите путь к картинке в БД (SVG → JPG). Разово на сервере/локально:
   ```bash
   node --input-type=module -e "import {DatabaseSync} from 'node:sqlite'; const db=new DatabaseSync('./data/market.db'); db.prepare(\"UPDATE products SET image='/products/'||sku||'.jpg'\").run(); console.log('ok')"
   ```
   Либо, если фото есть не для всех товаров, обновляйте точечно по нужным SKU.
3. Для будущих пересевов поменяйте расширение в `src/lib/db.ts` (строка
   `image: \`/products/${p.sku}.svg\``) и в `scripts/seed.ts`.
4. Проверьте, что `next/image` отдаёт фото (карточка и галерея). Формат JPG/PNG
   `next/image` оптимизирует сам; никаких доп. настроек не нужно.

SVG-плейсхолдеры можно оставить как фолбэк для товаров без фото.

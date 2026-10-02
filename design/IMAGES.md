# Фотографии для редизайна: список, размеры, промпты

Стиль — `design/DESIGN.md` §6 («Quiet Luxury Beauty Editorial»): мягкий дневной свет, тёплая нейтральная гамма 4500–5200K, травертин / известняк / лён, без глянца, неона и 3D.
Модель: `fal-ai/flux-pro/v1.1`. Конвертация в WebP (quality 82) — в скрипте. Страницы подхватывают файлы автоматически (`src/lib/designImages.ts`); пока файла нет — работают запасные фото (существующие обложки категорий, фото товаров, `model-hero.png`).

Запуск (ключ только из окружения, в коде не хранится):

```bash
FAL_KEY=... node scripts/generate-design-images.mjs
```

Пробные фото товара в новом стиле (на сайт не попадают): `TRIALS=1 FAL_KEY=... node scripts/generate-design-images.mjs`.
Посмотреть промпты без ключа: `DRY_RUN=1 node scripts/generate-design-images.mjs`.

Кадры с людьми (hero, ritual-3, values-3) — с суффиксом «естественная кожа, поры, лёгкая асимметрия, выбившиеся волоски, плёночное зерно, без зеркал и отражений».

**Общий суффикс стиля** (добавляется к каждому промпту):

```text
quiet luxury beauty editorial photography, soft natural daylight through a window, morning sun, warm neutral color temperature 4500-5200K, natural soft shadows, matte surfaces on travertine, light limestone and linen, ivory beige sand cream warm stone palette with a touch of olive green, photorealistic, shot on 50mm lens, shallow depth of field, no text, no letters, no logos, no brand names, unbranded packaging, no gloss, no neon, no acid colors, no studio flash, no cold blue light, not a 3D render
```

**Дополнительно для кадров с людьми и кожей:**

```text
natural skin texture with visible pores, slight facial asymmetry, a few flyaway hairs, light film grain, minimal retouching, no mirrors, no reflections
```


## Для сайта → public/images/design/

| Файл | Размер, px | Пропорции | Где используется |
|---|---|---|---|
| `hero.webp` | 1440×800 | 9:5 | Главная, hero (full-bleed, текст слева — левая треть кадра спокойная, без деталей) |
| `category-face-care.webp` | 1280×960 | 4:3 | Главная, карточка «Уход за лицом» |
| `category-body-care.webp` | 1280×960 | 4:3 | Главная, карточка «Уход за телом» |
| `category-hair-care.webp` | 1280×960 | 4:3 | Главная, карточка «Уход за волосами» |
| `category-makeup.webp` | 1280×960 | 4:3 | Главная, карточка «Макияж» |
| `category-perfume.webp` | 1280×960 | 4:3 | Главная, карточка «Парфюмерия» |
| `category-accessories.webp` | 1280×960 | 4:3 | Главная, карточка «Аксессуары для красоты» |
| `ritual-banner.webp` | 1440×640 | 9:4 | Главная, фон блока «Ритуал ухода» (справа спокойный кадр, слева — текст) |
| `ritual-1.webp` | 768×960 | 4:5 | «Ритуал ухода», шаг 01 (очищение) |
| `ritual-2.webp` | 768×960 | 4:5 | «Ритуал ухода», шаг 02 (активный уход) |
| `ritual-3.webp` | 768×960 | 4:5 | «Ритуал ухода», шаг 03 (увлажнение; руки с кремом) |
| `values-1.webp` | 896×1344 | 2:3 | «Больше, чем косметика», большая плитка «Внимание к деталям» |
| `values-2.webp` | 960×720 | 4:3 | «Больше, чем косметика», плитка «Спокойный ритуал» |
| `values-3.webp` | 960×720 | 4:3 | «Больше, чем косметика», плитка «Забота о себе» |
| `cta-banner.webp` | 1440×576 | 5:2 | Главная, финальный баннер (справа спокойный кадр, слева — текст) |

**hero** (человек)

```text
close-up beauty portrait of a young woman with a sleek low bun, her fingertips lightly touching her cheek, face on the right half of the frame, left third of the frame calm warm beige empty wall with soft window light, bare shoulders in a cream linen top, serene expression, glowing healthy skin
```

**category-face-care**

```text
still life flat lay of an unbranded frosted white glass cream jar and a matte dropper bottle on a travertine slab, a folded linen cloth, a sprig of dried olive branch, soft window light shadows
```

**category-body-care**

```text
still life of an unbranded amber glass pump bottle and a matte ceramic body butter jar on light limestone, a natural linen towel, a wooden body brush, sunlit morning shadows
```

**category-hair-care**

```text
still life of two unbranded matte beige shampoo and conditioner bottles with a natural wooden comb on a linen surface by a window, soft morning light, dried grass stems
```

**category-makeup**

```text
still life of unbranded matte makeup products — a nude lipstick, a compact powder, a soft brush — arranged on a warm stone surface with a linen cloth, soft diffused daylight
```

**category-perfume**

```text
still life of an unbranded minimal frosted milk glass perfume bottle with a matte cap on a travertine plinth, a dried flower, window light casting long soft shadows on plaster wall
```

**category-accessories**

```text
still life of beauty accessories — a rose quartz face roller, a wooden gua sha, a linen pouch, a bamboo brush — on a limestone surface, soft daylight
```

**ritual-banner**

```text
wide calm bathroom shelf scene: white ceramic bowl of water with a floating flower, folded linen towels, unbranded matte bottles on a travertine surface, matte plaster wall, sunlight stripe from the window on the right, left side of frame soft and empty
```

**ritual-1**

```text
close-up of a clear unbranded cleansing bottle and a cotton pad on a wet travertine tray, water droplets, soft morning light, linen background
```

**ritual-2**

```text
close-up of an unbranded amber glass dropper bottle with a single golden drop, resting on a light limestone block, ivory linen behind, warm window light
```

**ritual-3** (человек)

```text
close-up of a woman's hands gently smoothing cream, an open unbranded matte white cream jar on a linen cloth, soft daylight, cropped without face
```

**values-1**

```text
tall composition: an unbranded dropper bottle and a matte cream jar among dried flowers and eucalyptus on a travertine pedestal, soft sunlight, plaster wall, shadows of leaves
```

**values-2**

```text
cozy morning corner: ceramic cup of tea, an open linen robe, matte skincare bottles on a wooden tray by the window, soft sunlight
```

**values-3** (человек)

```text
a woman from behind in a cream linen robe holding a ceramic mug near a sunlit window, face not visible, soft glow, warm beige interior
```

**cta-banner**

```text
wide still life: unbranded matte skincare bottles and a dried olive branch on a travertine surface, left half of the frame calm warm beige plaster wall, soft sunlight from the right
```


## Пробные фото товара → design/trials/

| Файл | Размер, px | Пропорции | Где используется |
|---|---|---|---|
| `trial-product-1-travertine.webp` | 1024×1280 | 4:5 | Пробник A: мицеллярная вода, травертин + утренний свет |
| `trial-product-2-linen.webp` | 1024×1280 | 4:5 | Пробник B: мицеллярная вода, лён + керамика |

**trial-product-1-travertine**

```text
single unbranded clear plastic cleansing water bottle with a white cap, centered on a light travertine slab, soft morning window light, gentle natural shadow, plain unbranded packaging
```

**trial-product-2-linen**

```text
single unbranded clear cleansing water bottle with a white cap on folded ivory linen next to a small white ceramic dish, a dried flower stem, diffused daylight from the left, plain unbranded packaging
```


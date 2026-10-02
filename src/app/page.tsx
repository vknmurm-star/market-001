import {
  getCategories,
  getFeaturedProducts,
  getProducts,
} from "@/lib/catalog";
import { categoryPhoto, designImage } from "@/lib/designImages";
import { plural } from "@/lib/format";
import CategoryCard from "@/components/CategoryCard";
import ProductGrid from "@/components/ProductGrid";
import SectionHeading from "@/components/ui/SectionHeading";
import Hero from "@/components/home/Hero";
import Advantages from "@/components/home/Advantages";
import Ritual, { type RitualStep } from "@/components/home/Ritual";
import Values from "@/components/home/Values";
import Reviews from "@/components/home/Reviews";
import CtaBanner from "@/components/home/CtaBanner";

export const revalidate = 60;

// Раскладка плиток категорий как на макете: 3 + 3 плитки разной ширины в
// 12-колоночной сетке. Фото сняты под эти ширины (слева свободное место под
// текст), поэтому известные категории идут в порядке макета; новые, если
// появятся, добавляются в конец со средней шириной.
const CATEGORY_LAYOUT: { slug: string; span: string }[] = [
  { slug: "face-care", span: "lg:col-span-3" },
  { slug: "hair-care", span: "lg:col-span-5" },
  { slug: "makeup", span: "lg:col-span-4" },
  { slug: "perfume", span: "lg:col-span-5" },
  { slug: "body-care", span: "lg:col-span-4" },
  { slug: "accessories", span: "lg:col-span-3" },
];
const DEFAULT_SPAN = "lg:col-span-4";

// Кадрирование фото в плитках и сила светлой подложки под текстом: на новых
// фото слева свободное место, а у узких плиток обрезается бо́льшая часть кадра.
const CATEGORY_LOOK: Record<string, { pos: string; scrim?: "soft" | "strong" }> = {
  "face-care": { pos: "4% 40%", scrim: "strong" },
  "hair-care": { pos: "60% 50%", scrim: "strong" },
  makeup: { pos: "50% 50%" },
  perfume: { pos: "35% 50%", scrim: "strong" },
  "body-care": { pos: "70% 50%", scrim: "strong" },
  accessories: { pos: "78% 50%", scrim: "strong" },
};

// Шаги ритуала — реальные товары из базы (по артикулу); если артикула нет,
// берём следующие по популярности товары категории «Уход за лицом».
const RITUAL = [
  { title: "Очищение", sku: "FC-003", image: "ritual-1" },
  { title: "Активный уход", sku: "FC-002", image: "ritual-2" },
  { title: "Увлажнение", sku: "FC-001", image: "ritual-3" },
];

export default function HomePage() {
  const categories = getCategories();
  const all = getProducts();
  const bestsellers = getFeaturedProducts(8);

  const rank = (slug: string) => {
    const i = CATEGORY_LAYOUT.findIndex((l) => l.slug === slug);
    return i === -1 ? CATEGORY_LAYOUT.length : i;
  };
  const orderedCategories = [...categories].sort((a, b) => rank(a.slug) - rank(b.slug));

  const counts = new Map<string, number>();
  for (const p of all) counts.set(p.categorySlug, (counts.get(p.categorySlug) ?? 0) + 1);

  const face = all.filter((p) => p.categorySlug === "face-care");
  const steps = RITUAL.flatMap((r, i): RitualStep[] => {
    const product = all.find((p) => p.sku === r.sku) ?? face[i];
    return product
      ? [{ title: r.title, product, image: designImage(r.image) }]
      : [];
  });

  const productsWord = plural(all.length, ["товар", "товара", "товаров"]);
  const categoriesWord = plural(categories.length, [
    "категории",
    "категориях",
    "категориях",
  ]);

  return (
    <>
      <Hero image={designImage("hero")} />
      <Advantages categoriesCount={categories.length} />

      <section aria-labelledby="categories-title" className="section-y">
        <div className="container-page">
          <SectionHeading
            as="h2"
            size="h3"
            title={<span id="categories-title">Категории</span>}
            actionHref="/catalog"
            actionLabel="Все категории"
          />
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-10 lg:grid-cols-12 lg:gap-6">
            {orderedCategories.map((c) => {
              const n = counts.get(c.slug) ?? 0;
              return (
                <CategoryCard
                  key={c.slug}
                  href={`/catalog/${c.slug}`}
                  name={c.name}
                  meta={`${n} ${plural(n, ["товар", "товара", "товаров"])}`}
                  image={categoryPhoto(c.slug)}
                  objectPosition={CATEGORY_LOOK[c.slug]?.pos}
                  scrim={CATEGORY_LOOK[c.slug]?.scrim}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                  className={`aspect-[16/10] sm:aspect-[4/3] lg:aspect-auto lg:h-[300px] ${
                    CATEGORY_LAYOUT.find((l) => l.slug === c.slug)?.span ?? DEFAULT_SPAN
                  }`}
                />
              );
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="bestsellers-title" className="pb-16 md:pb-24">
        <div className="container-page">
          <SectionHeading
            as="h2"
            size="h3"
            title={<span id="bestsellers-title">Бестселлеры</span>}
            actionHref="/catalog"
            actionLabel="Смотреть все"
          />
          <div className="mt-8 md:mt-10">
            <ProductGrid products={bestsellers} />
          </div>
        </div>
      </section>

      {steps.length > 0 && (
        <Ritual
          steps={steps}
          bannerImage={designImage("ritual-banner")}
          categoryHref="/catalog/face-care"
        />
      )}

      <Values
        tiles={[
          {
            title: "Качество в каждой детали",
            image: designImage("values-1") ?? categoryPhoto("face-care"),
            tone: "light-on-dark",
          },
          {
            title: "Красота в гармонии с природой",
            image: designImage("values-2") ?? categoryPhoto("body-care"),
            tone: "dark-left",
          },
          {
            title: "Забота о вас и планете",
            image: designImage("values-3") ?? categoryPhoto("perfume"),
            tone: "dark-left",
          },
        ]}
      />

      <Reviews />

      {/* -mb-24 гасит верхний отступ подвала: баннер примыкает к нему вплотную */}
      <div className="-mb-24">
        <CtaBanner
          image={designImage("cta-banner")}
          productsCount={`${all.length} ${productsWord}`}
          categoriesText={`в ${categories.length} ${categoriesWord}`}
        />
      </div>
    </>
  );
}

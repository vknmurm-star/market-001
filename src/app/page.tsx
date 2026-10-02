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

// Ширины карточек категорий в 12-колоночной сетке (editorial: 3 + 3 разной ширины)
const CATEGORY_SPANS = [
  "lg:col-span-3",
  "lg:col-span-5",
  "lg:col-span-4",
  "lg:col-span-5",
  "lg:col-span-4",
  "lg:col-span-3",
];

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
          <div className="mt-8 grid grid-cols-2 gap-3 md:mt-10 md:grid-cols-3 md:gap-4 lg:grid-cols-12 lg:gap-6">
            {categories.map((c, i) => {
              const n = counts.get(c.slug) ?? 0;
              return (
                <CategoryCard
                  key={c.slug}
                  href={`/catalog/${c.slug}`}
                  name={c.name}
                  meta={`${n} ${plural(n, ["товар", "товара", "товаров"])}`}
                  image={categoryPhoto(c.slug)}
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 30vw"
                  className={`aspect-[4/5] md:aspect-[4/3] lg:aspect-auto lg:h-[300px] ${
                    CATEGORY_SPANS[i % CATEGORY_SPANS.length]
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
          { title: "Внимание к деталям", image: designImage("values-1") ?? categoryPhoto("face-care") },
          { title: "Спокойный ритуал", image: designImage("values-2") ?? categoryPhoto("body-care") },
          { title: "Забота о себе", image: designImage("values-3") ?? categoryPhoto("perfume") },
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

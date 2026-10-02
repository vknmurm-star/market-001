import Image from "next/image";
import Button from "@/components/ui/Button";

/**
 * Финальный баннер. Вместо формы подписки (рассылки в магазине нет) — заголовок
 * и кнопка «Перейти в каталог» в той же стилистике.
 */
export default function CtaBanner({
  image,
  productsCount,
  categoriesText,
}: {
  image: string | null;
  productsCount: string;
  categoriesText: string;
}) {
  return (
    <section aria-labelledby="cta-title" className="relative isolate overflow-hidden bg-surface-alt">
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          sizes="100vw"
          className="-z-20 object-cover object-[50%_62%]"
        />
      ) : null}
      {/* на фото слева свободная стена: лёгкая светлая вуаль под заголовком */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-background/70 md:bg-transparent md:bg-gradient-to-r md:from-background/80 md:via-background/40 md:to-transparent"
      />
      <div className="container-page flex flex-col items-start gap-8 py-16 md:flex-row md:items-center md:justify-between md:py-24">
        <div className="max-w-xl">
          <p className="type-caption mb-4 text-secondary">Каталог</p>
          <h2 id="cta-title" className="type-h3">
            Откройте для себя новинки и любимые средства
          </h2>
          <p className="type-small mt-4 text-secondary">
            {productsCount} {categoriesText}
          </p>
        </div>
        <Button href="/catalog" arrow>
          Перейти в каталог
        </Button>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { ArrowRight } from "@/components/ui/icons";
import type { Product } from "@/lib/types";

export interface RitualStep {
  title: string;
  /** товар из базы, на который ведёт шаг */
  product: Product;
  /** редакционное фото шага; если нет — фото самого товара */
  image: string | null;
}

/**
 * «Ритуал ухода»: баннер с заголовком и три шага 01/02/03, наезжающие на
 * нижний край баннера. Шаги и их описания собраны из реальных товаров базы,
 * номера — курсивный Cormorant в светлом акценте.
 */
export default function Ritual({
  steps,
  bannerImage,
  categoryHref,
}: {
  steps: RitualStep[];
  bannerImage: string | null;
  categoryHref: string;
}) {
  return (
    <section aria-labelledby="ritual-title">
      <div className="relative isolate overflow-hidden bg-surface-alt">
        {bannerImage ? (
          <Image
            src={bannerImage}
            alt=""
            fill
            sizes="100vw"
            className="-z-20 object-cover object-[75%_center] md:object-right"
          />
        ) : null}
        {/* мобильный: мягкая вуаль сверху вниз под текстом;
            десктоп: вуаль только слева под текстом, правая часть с лицом чистая */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-b from-background/80 via-background/35 to-transparent md:hidden"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 hidden md:block"
          style={{
            background:
              "linear-gradient(to right, rgba(247,243,238,.92) 0%, rgba(247,243,238,.78) 26%, rgba(247,243,238,.3) 42%, rgba(247,243,238,0) 54%)",
          }}
        />
        <div className="container-page pb-40 pt-14 md:pb-48 md:pt-20">
          <p className="type-caption mb-4 text-secondary">Ритуал красоты</p>
          <h2 id="ritual-title" className="type-h2">
            Ритуал ухода
          </h2>
          <p className="type-body mt-5 max-w-sm text-secondary">
            Три простых шага к здоровой, сияющей коже. Подберите средства для
            своего ритуала.
          </p>
          <div className="mt-8">
            <Button href={categoryHref} arrow>
              Все средства для ухода
            </Button>
          </div>
        </div>
      </div>

      <div className="container-page">
        <ol className="-mt-28 grid gap-4 md:-mt-32 md:grid-cols-3 md:gap-6">
          {steps.map((s, i) => {
            const src = s.image ?? s.product.image;
            return (
              <li key={s.title} className="group relative flex overflow-hidden rounded-md bg-surface shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
                <Link
                  href={`/product/${s.product.slug}`}
                  className="grid min-h-[220px] w-full grid-cols-[1fr_42%] md:min-h-[260px]"
                >
                  <div className="flex flex-col p-5 md:p-7">
                    <span
                      aria-hidden
                      className="font-numeral text-[44px] italic leading-none text-accent-light md:text-[52px]"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 text-[26px] leading-[1.1]">{s.title}</h3>
                    <p className="type-small mt-2 line-clamp-4 text-secondary">
                      {s.product.description}
                    </p>
                    <span className="type-small mt-auto inline-flex items-center gap-2 pt-4 font-semibold text-accent transition-all duration-300 ease-brand group-hover:gap-3">
                      Перейти к товару
                      <ArrowRight />
                    </span>
                  </div>
                  <div className="relative bg-surface-alt">
                    {src && (
                      <Image
                        src={src}
                        alt={s.product.name}
                        fill
                        sizes="(max-width: 768px) 40vw, 14vw"
                        className="object-cover transition-transform duration-300 ease-brand group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "./ui/icons";

/**
 * Карточка категории по макету: фото cover, название тёмным антиквенным
 * шрифтом внизу слева, под ним короткая подпись и стрелка. Слева на фото
 * свободное место; для читаемости поверх лежит лёгкая светлая подложка
 * (из нижнего левого угла), на сложных кадрах её можно усилить (`scrim`).
 * Hover: фото плавно увеличивается 1 → 1.02 (сама карточка не двигается).
 * Размеры задаёт родитель (className), чтобы собирать editorial-сетку.
 */
export default function CategoryCard({
  href,
  name,
  meta,
  image,
  sizes,
  className = "",
  priority = false,
  objectPosition = "50% 50%",
  scrim = "soft",
}: {
  href: string;
  name: string;
  /** вторая строка под названием, например «5 товаров» (из базы) */
  meta?: string;
  image: string | null;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** кадрирование фото в карточке (CSS object-position) */
  objectPosition?: string;
  /** сила светлой подложки под текстом */
  scrim?: "soft" | "strong";
}) {
  const a = scrim === "strong" ? [0.88, 0.6] : [0.72, 0.4];
  return (
    <Link
      href={href}
      className={`group relative isolate block overflow-hidden rounded-md bg-surface-alt ${className}`}
    >
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          sizes={sizes}
          preload={priority}
          style={{ objectPosition }}
          className="-z-10 object-cover transition-transform duration-300 ease-brand group-hover:scale-[1.02]"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-br from-surface-alt to-accent-light/60"
        />
      )}
      {/* светлая подложка цвета фона сайта (#F7F3EE) из левого нижнего угла */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(to top right, rgba(247,243,238,${a[0]}) 0%, rgba(247,243,238,${a[1]}) 32%, rgba(247,243,238,0) 62%)`,
        }}
      />
      <div className="flex h-full flex-col justify-end p-5 md:p-7">
        <h3 className="max-w-[80%] font-display text-[24px] leading-[1.1] text-foreground md:text-[30px]">
          {name}
        </h3>
        {meta && <p className="type-small mt-1.5 text-secondary">{meta}</p>}
        <span className="mt-3 inline-flex text-foreground transition-transform duration-300 ease-brand group-hover:translate-x-1">
          <ArrowRight />
        </span>
      </div>
    </Link>
  );
}

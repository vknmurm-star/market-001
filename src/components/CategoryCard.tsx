import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "./ui/icons";

/**
 * Карточка категории: фото cover, затемнение снизу, подпись и стрелка.
 * Hover — фото плавно увеличивается 1 → 1.02 (сама карточка не двигается).
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
}: {
  href: string;
  name: string;
  /** вторая строка под названием, например «5 товаров» (из базы) */
  meta?: string;
  image: string | null;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
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
          className="-z-10 object-cover transition-transform duration-300 ease-brand group-hover:scale-[1.02]"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-br from-surface-alt to-accent-light/60"
        />
      )}
      {/* затемнение из DESIGN.md: прозрачный → rgba(0,0,0,.25); чуть плотнее
          у нижнего края, чтобы белая подпись читалась на светлых фото */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,.42) 0%, rgba(0,0,0,.25) 38%, rgba(0,0,0,0) 72%)",
        }}
      />
      <div className="flex h-full flex-col justify-end p-5 text-white md:p-7">
        <h3 className="font-display text-[26px] leading-[1.1] text-white [text-shadow:0_1px_14px_rgba(0,0,0,0.3)] md:text-[30px]">
          {name}
        </h3>
        {meta && <p className="type-small mt-1 text-white/85">{meta}</p>}
        <span className="mt-3 inline-flex transition-transform duration-300 ease-brand group-hover:translate-x-1">
          <ArrowRight />
        </span>
      </div>
    </Link>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

export default function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const list = images.filter(Boolean);
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const main = list[active] ?? "/products/accessories.svg";
  const multi = list.length > 1;

  const step = useCallback(
    (delta: number) =>
      setActive((a) => (a + delta + list.length) % list.length),
    [list.length],
  );

  // Лайтбокс: закрытие по Esc, стрелки для нескольких фото, блокировка скролла.
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
      else if (multi && e.key === "ArrowRight") step(1);
      else if (multi && e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [zoom, multi, step]);

  return (
    <div className="flex flex-col gap-3">
      {/* Основное фото — кликабельно, открывает увеличенную версию */}
      <button
        type="button"
        onClick={() => setZoom(true)}
        aria-label="Увеличить изображение"
        className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl border bg-card"
      >
        <Image
          src={main}
          alt={alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition group-hover:scale-[1.02]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition group-hover:opacity-100"
        >
          {/* иконка лупы */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      {multi && (
        <div className="flex gap-3">
          {list.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Показать изображение ${i + 1}`}
              aria-current={i === active}
              className={`relative aspect-square w-20 overflow-hidden rounded-xl border-2 bg-card transition ${
                i === active
                  ? "border-accent"
                  : "border-transparent hover:border-border"
              }`}
            >
              <Image
                src={src}
                alt={`${alt} — вид ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Просмотр изображения"
          onClick={() => setZoom(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-8"
        >
          <button
            type="button"
            onClick={() => setZoom(false)}
            aria-label="Закрыть"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white transition hover:bg-white/25"
          >
            ✕
          </button>

          {multi && (
            <>
              <button
                type="button"
                aria-label="Предыдущее"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl leading-none text-white transition hover:bg-white/25"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Следующее"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl leading-none text-white transition hover:bg-white/25"
              >
                ›
              </button>
            </>
          )}

          {/* полноразмерное изображение (клик по нему не закрывает оверлей) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={main}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
          />

          {multi && (
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
              {active + 1} / {list.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

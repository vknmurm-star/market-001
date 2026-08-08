"use client";

import { useState } from "react";
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
  const main = list[active] ?? "/products/accessories.svg";

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-3xl border bg-card">
        <Image
          src={main}
          alt={alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {list.length > 1 && (
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
    </div>
  );
}

"use client";

import { useState } from "react";
import type { ProductImage } from "@/lib/adminData";
import ImageZoom from "@/components/ImageZoom";

const MAX = 4;

export default function ProductImagesEditor({
  images,
}: {
  images: ProductImage[];
}) {
  const byId = new Map(images.map((i) => [i.id, i]));
  const [order, setOrder] = useState<number[]>(images.map((i) => i.id));
  const [deleted, setDeleted] = useState<Set<number>>(new Set());

  const kept = order.filter((id) => !deleted.has(id));
  const remaining = Math.max(0, MAX - kept.length);
  const firstKept = kept[0];

  function move(index: number, dir: -1 | 1) {
    setOrder((prev) => {
      const a = [...prev];
      const j = index + dir;
      if (j < 0 || j >= a.length) return a;
      [a[index], a[j]] = [a[j], a[index]];
      return a;
    });
  }

  function toggleDelete(id: number) {
    setDeleted((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  }

  return (
    <div className="space-y-3">
      {/* Скрытые поля для сервера */}
      <input type="hidden" name="imageOrder" value={kept.join(",")} />
      {[...deleted].map((id) => (
        <input key={id} type="hidden" name="deleteImage" value={id} />
      ))}

      {order.length > 0 && (
        <ul className="space-y-2">
          {order.map((id, index) => {
            const img = byId.get(id);
            if (!img) return null;
            const isDeleted = deleted.has(id);
            const isMain = !isDeleted && id === firstKept;
            return (
              <li
                key={id}
                className={`flex items-center gap-3 rounded-lg border bg-card p-2 ${
                  isDeleted ? "opacity-50" : ""
                }`}
              >
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-background">
                  <ImageZoom
                    src={img.path}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </span>

                {isMain && (
                  <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
                    главное
                  </span>
                )}

                <div className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0 || isDeleted}
                    aria-label="Выше"
                    className="rounded-md border px-2 py-1 text-sm disabled:opacity-30 hover:enabled:border-accent"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === order.length - 1 || isDeleted}
                    aria-label="Ниже"
                    className="rounded-md border px-2 py-1 text-sm disabled:opacity-30 hover:enabled:border-accent"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleDelete(id)}
                    className={`rounded-md border px-3 py-1 text-sm ${
                      isDeleted
                        ? "border-accent text-accent-dark"
                        : "text-muted hover:border-accent hover:text-accent"
                    }`}
                  >
                    {isDeleted ? "вернуть" : "удалить"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-medium">
          Добавить изображения
        </span>
        <input
          type="file"
          name="imageFile"
          multiple
          accept="image/png,image/jpeg,image/webp,image/gif"
          disabled={remaining === 0}
          className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-accent-dark disabled:opacity-50"
        />
        <span className="mt-1 block text-xs text-muted">
          {remaining > 0
            ? `Можно добавить ещё ${remaining} (максимум ${MAX}). JPG, PNG, WEBP или GIF, до 5 МБ.`
            : `Достигнут максимум — ${MAX} изображения. Удалите лишние, чтобы добавить новые.`}
          {" "}Порядок меняйте стрелками, первое — главное (на карточках).
        </span>
      </label>
    </div>
  );
}

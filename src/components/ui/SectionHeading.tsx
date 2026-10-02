import type { ReactNode } from "react";
import Button from "./Button";

/**
 * Заголовок секции: caption вразрядку над заголовком (необязателен) и
 * ссылка «Все …» справа (необязательна). Заголовок — Cormorant, шкала H2/H3.
 */
export default function SectionHeading({
  caption,
  title,
  as: Tag = "h2",
  size = "h2",
  actionHref,
  actionLabel,
  className = "",
  children,
}: {
  caption?: string;
  title: ReactNode;
  as?: "h1" | "h2" | "h3";
  size?: "h2" | "h3";
  actionHref?: string;
  actionLabel?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-x-8 gap-y-4 ${className}`}>
      <div className="max-w-2xl">
        {caption && <p className="type-caption mb-4 text-secondary">{caption}</p>}
        <Tag className={size === "h2" ? "type-h2" : "type-h3"}>{title}</Tag>
        {children}
      </div>
      {actionHref && actionLabel && (
        <Button href={actionHref} variant="text" size="sm" className="pb-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

import type { ComponentProps } from "react";

/**
 * Поле ввода: 56px, радиус 6, белый фон, граница #E6DED4, focus — акцентная
 * граница. Строки классов экспортируются отдельно — их же используют
 * <select>/<textarea> и PasswordInput, чтобы все поля выглядели одинаково.
 */
export const inputClass =
  "block h-14 w-full rounded-sm border border-border bg-white px-4 text-[15px] text-foreground placeholder:text-muted outline-none transition-colors ease-brand focus:border-accent";

export const textareaClass =
  "block min-h-28 w-full rounded-sm border border-border bg-white px-4 py-3.5 text-[15px] text-foreground placeholder:text-muted outline-none transition-colors ease-brand focus:border-accent";

export const selectClass = inputClass;

/** Компактное поле (48px) — панель фильтров каталога. */
export const inputSmClass =
  "block h-12 rounded-sm border border-border bg-white px-4 text-sm text-foreground placeholder:text-muted outline-none transition-colors ease-brand focus:border-accent";

export default function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={`${inputClass} ${className}`.trim()} {...props} />;
}

/** Подпись поля: Manrope 14px, 500 */
export const labelClass = "mb-1.5 block text-sm font-medium text-foreground";

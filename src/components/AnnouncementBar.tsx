import { getSetting } from "@/lib/settings";
import { formatPrice } from "@/lib/site";

/**
 * Тонкая терракотовая полоса над шапкой (40px). Сумма бесплатной доставки
 * берётся из настройки магазина `free_shipping_threshold` (таблица settings).
 * Пока настройки нет — выводим только проверяемый факт о службах доставки,
 * без выдуманной суммы.
 */
export default function AnnouncementBar() {
  const raw = getSetting("free_shipping_threshold");
  const threshold = raw ? Number(raw) : NaN;
  const text =
    Number.isFinite(threshold) && threshold > 0
      ? `Бесплатная доставка по России при заказе от ${formatPrice(threshold)}`
      : "Доставка по России: СДЭК, Boxberry, DPD, 5Post, Почта России";

  return (
    <div className="flex h-10 items-center justify-center bg-accent px-4 text-center text-[13px] font-medium leading-none tracking-[0.02em] text-white">
      <p className="truncate">{text}</p>
    </div>
  );
}

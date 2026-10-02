import { formatPrice } from "@/lib/site";

export default function PriceTag({
  price,
  oldPrice,
  size = "md",
}: {
  price: number;
  oldPrice?: number | null;
  size?: "md" | "lg";
}) {
  const priceClass =
    size === "lg"
      ? "text-[28px] font-semibold leading-none"
      : "text-[17px] font-semibold leading-none";
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className={`${priceClass} text-foreground`}>{formatPrice(price)}</span>
      {oldPrice && oldPrice > price && (
        <span className="text-sm text-secondary line-through">
          {formatPrice(oldPrice)}
        </span>
      )}
    </div>
  );
}

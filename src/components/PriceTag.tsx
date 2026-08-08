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
  const priceClass = size === "lg" ? "text-2xl font-bold" : "text-lg font-semibold";
  return (
    <div className="flex items-baseline gap-2">
      <span className={`${priceClass} text-foreground`}>{formatPrice(price)}</span>
      {oldPrice && oldPrice > price && (
        <span className="text-sm text-muted line-through">
          {formatPrice(oldPrice)}
        </span>
      )}
    </div>
  );
}

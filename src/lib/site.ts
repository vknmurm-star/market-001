export const SITE_URL = (process.env.SITE_URL ?? "https://beauty.an51.su").replace(
  /\/$/,
  "",
);

export const SITE_NAME = "Beauty";

export const SITE_DESCRIPTION =
  "Интернет-магазин косметики и средств для красоты: уход за лицом и телом, волосы, макияж, парфюмерия и аксессуары. Доставка курьером и самовывоз.";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Форматирование цены в рублях: 1290 -> "1 290 ₽" */
export function formatPrice(value: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}

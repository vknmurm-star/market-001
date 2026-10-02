import Link from "next/link";
import { SITE_URL } from "@/lib/site";

export interface Crumb {
  name: string;
  href: string;
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.href}`,
    })),
  };

  return (
    <nav aria-label="Хлебные крошки" className="type-small text-secondary">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((c, i) => (
          <li key={c.href} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden className="text-border">
                /
              </span>
            )}
            {i < items.length - 1 ? (
              <Link
                href={c.href}
                className="link-underline transition-colors ease-brand hover:text-accent"
              >
                {c.name}
              </Link>
            ) : (
              <span className="text-foreground" aria-current="page">
                {c.name}
              </span>
            )}
          </li>
        ))}
      </ol>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </nav>
  );
}

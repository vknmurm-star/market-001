import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Контакты",
  description: `Связаться с интернет-магазином косметики Beauty: ${CONTACT_EMAIL}.`,
  alternates: { canonical: "/contacts" },
};

export default function ContactsPage() {
  return (
    <div className="container-page pb-16 pt-8 md:pb-24 md:pt-12">
      <Breadcrumbs
        items={[
          { name: "Главная", href: "/" },
          { name: "Контакты", href: "/contacts" },
        ]}
      />
      <div className="mt-8 max-w-3xl md:mt-10">
        <p className="type-caption mb-4 text-secondary">Beauty</p>
        <h1 className="type-h2">Контакты</h1>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 md:gap-6">
          <div className="rounded-md bg-surface p-7 md:p-8">
            <div className="type-caption text-[11px] text-secondary">Email</div>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-3 block break-all font-display text-[28px] leading-tight text-foreground transition-colors ease-brand hover:text-accent"
            >
              {CONTACT_EMAIL}
            </a>
            <div className="type-small mt-2 text-secondary">по вопросам заказов и товаров</div>
          </div>
          <div className="rounded-md bg-surface p-7 md:p-8">
            <div className="type-caption text-[11px] text-secondary">Доставка</div>
            <div className="mt-3 font-display text-[28px] leading-tight text-foreground">По всей России</div>
            <div className="type-small mt-2 text-secondary">курьер и самовывоз</div>
          </div>
        </div>
      </div>
    </div>
  );
}

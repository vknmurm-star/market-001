import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Контакты и режим работы интернет-магазина косметики Beauty.",
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
            <div className="type-caption text-[11px] text-secondary">Служба поддержки</div>
            <div className="mt-3 font-display text-[28px] leading-tight text-foreground">8 800 000-00-00</div>
            <div className="type-small mt-2 text-secondary">звонок по России бесплатный</div>
          </div>
          <div className="rounded-md bg-surface p-7 md:p-8">
            <div className="type-caption text-[11px] text-secondary">Email</div>
            <div className="mt-3 font-display text-[28px] leading-tight text-foreground">shop@beauty.an51.su</div>
            <div className="type-small mt-2 text-secondary">отвечаем в течение дня</div>
          </div>
          <div className="rounded-md bg-surface p-7 md:p-8">
            <div className="type-caption text-[11px] text-secondary">Режим работы</div>
            <div className="mt-3 font-display text-[28px] leading-tight text-foreground">Пн–Вс, 9:00–21:00</div>
            <div className="type-small mt-2 text-secondary">без выходных</div>
          </div>
          <div className="rounded-md bg-surface p-7 md:p-8">
            <div className="type-caption text-[11px] text-secondary">Доставка</div>
            <div className="mt-3 font-display text-[28px] leading-tight text-foreground">По всей России</div>
            <div className="type-small mt-2 text-secondary">курьер и самовывоз</div>
          </div>
        </div>

        <p className="type-small mt-12 rounded-md bg-surface-alt p-5 text-secondary">
          Контактные данные указаны для демонстрации и не являются действующими.
        </p>
      </div>
    </div>
  );
}

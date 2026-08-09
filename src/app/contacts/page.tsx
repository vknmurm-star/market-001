import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Контакты и режим работы интернет-магазина косметики Beauty.",
  alternates: { canonical: "/contacts" },
};

export default function ContactsPage() {
  return (
    <div className="container-page py-8">
      <Breadcrumbs
        items={[
          { name: "Главная", href: "/" },
          { name: "Контакты", href: "/contacts" },
        ]}
      />
      <div className="mt-6 max-w-3xl">
        <h1 className="text-3xl font-bold">Контакты</h1>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border bg-card p-6">
            <div className="text-sm text-muted">Служба поддержки</div>
            <div className="mt-1 text-lg font-semibold">8 800 000-00-00</div>
            <div className="mt-1 text-sm text-muted">звонок по России бесплатный</div>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <div className="text-sm text-muted">Email</div>
            <div className="mt-1 text-lg font-semibold">shop@market.an51.su</div>
            <div className="mt-1 text-sm text-muted">отвечаем в течение дня</div>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <div className="text-sm text-muted">Режим работы</div>
            <div className="mt-1 text-lg font-semibold">Пн–Вс, 9:00–21:00</div>
            <div className="mt-1 text-sm text-muted">без выходных</div>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <div className="text-sm text-muted">Доставка</div>
            <div className="mt-1 text-lg font-semibold">По всей России</div>
            <div className="mt-1 text-sm text-muted">курьер и самовывоз</div>
          </div>
        </div>

        <p className="mt-8 rounded-2xl bg-accent-soft p-4 text-sm text-accent-dark">
          Контактные данные указаны для демонстрации и не являются действующими.
        </p>
      </div>
    </div>
  );
}

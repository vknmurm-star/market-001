import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Доставка и оплата",
  description:
    "Способы доставки (курьер по России, самовывоз) и оплаты (онлайн-картой или при получении) в интернет-магазине косметики Маркет.",
  alternates: { canonical: "/delivery" },
};

const DELIVERY = [
  ["Курьером по России", "1–5 рабочих дней", "От 0 ₽ при заказе от 3 000 ₽, иначе 300 ₽"],
  ["Самовывоз из пункта выдачи", "1–3 рабочих дня", "Бесплатно"],
];

const PAYMENT = [
  ["Онлайн-картой", "Банковской картой на сайте через ЮKassa (в демо — тестовый режим)"],
  ["При получении", "Наличными или картой курьеру / на самовывозе"],
];

export default function DeliveryPage() {
  return (
    <div className="container-page py-8">
      <Breadcrumbs
        items={[
          { name: "Главная", href: "/" },
          { name: "Доставка и оплата", href: "/delivery" },
        ]}
      />
      <div className="mt-6 max-w-3xl">
        <h1 className="text-3xl font-bold">Доставка и оплата</h1>

        <h2 className="mt-8 text-xl font-semibold">Доставка</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="border-b bg-background/60 text-left text-muted">
              <tr>
                <th className="px-4 py-3">Способ</th>
                <th className="px-4 py-3">Срок</th>
                <th className="px-4 py-3">Стоимость</th>
              </tr>
            </thead>
            <tbody>
              {DELIVERY.map(([m, t, p]) => (
                <tr key={m} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{m}</td>
                  <td className="px-4 py-3 text-muted">{t}</td>
                  <td className="px-4 py-3">{p}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-8 text-xl font-semibold">Оплата</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {PAYMENT.map(([m, d]) => (
            <div key={m} className="rounded-2xl border bg-card p-5">
              <div className="font-semibold">{m}</div>
              <div className="mt-1 text-sm text-muted">{d}</div>
            </div>
          ))}
        </div>

        <p className="mt-8 rounded-2xl bg-accent-soft p-4 text-sm text-accent-dark">
          Демонстрационный магазин: реальная доставка не выполняется, онлайн-оплата
          работает в тестовом режиме и не списывает деньги.
        </p>
      </div>
    </div>
  );
}

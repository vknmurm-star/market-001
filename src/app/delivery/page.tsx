import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Доставка и оплата",
  description:
    "Способы доставки (СДЭК, Boxberry, DPD, 5Post, Почта России) и оплаты (картой, СБП или при получении) в интернет-магазине косметики Beauty.",
  alternates: { canonical: "/delivery" },
};

const DELIVERY = [
  ["СДЭК", "1–5 рабочих дней", "Курьер или пункт выдачи, от 250 ₽"],
  ["Boxberry", "2–6 рабочих дней", "Пункты выдачи, от 200 ₽"],
  ["DPD", "1–5 рабочих дней", "Курьер или ПВЗ, от 300 ₽"],
  ["5Post", "2–6 рабочих дней", "Постаматы и пункты выдачи, от 150 ₽"],
  ["Почта России", "3–10 рабочих дней", "Отделения по всей стране, от 150 ₽"],
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

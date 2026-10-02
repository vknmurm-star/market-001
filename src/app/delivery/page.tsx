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
    <div className="container-page pb-16 pt-8 md:pb-24 md:pt-12">
      <Breadcrumbs
        items={[
          { name: "Главная", href: "/" },
          { name: "Доставка и оплата", href: "/delivery" },
        ]}
      />
      <div className="mt-8 max-w-3xl md:mt-10">
        <p className="type-caption mb-4 text-secondary">Покупателям</p>
        <h1 className="type-h2">Доставка и оплата</h1>

        <h2 className="type-h4 mt-14">Доставка</h2>
        <div className="mt-6 overflow-x-auto rounded-md bg-surface">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="type-caption border-b border-border text-left text-[11px] text-secondary">
              <tr>
                <th className="px-6 py-4 font-medium">Способ</th>
                <th className="px-6 py-4 font-medium">Срок</th>
                <th className="px-6 py-4 font-medium">Стоимость</th>
              </tr>
            </thead>
            <tbody>
              {DELIVERY.map(([m, t, p]) => (
                <tr key={m} className="border-b border-border-soft last:border-0">
                  <td className="px-6 py-4 font-medium text-foreground">{m}</td>
                  <td className="px-6 py-4 text-secondary">{t}</td>
                  <td className="px-6 py-4 text-foreground">{p}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="type-h4 mt-14">Оплата</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:gap-6">
          {PAYMENT.map(([m, d]) => (
            <div key={m} className="rounded-md bg-surface p-6 md:p-7">
              <div className="font-display text-[26px] leading-tight">{m}</div>
              <div className="type-small mt-2 text-secondary">{d}</div>
            </div>
          ))}
        </div>

        <p className="type-small mt-12 rounded-md bg-surface-alt p-5 text-secondary">
          Демонстрационный магазин: реальная доставка не выполняется, онлайн-оплата
          работает в тестовом режиме и не списывает деньги.
        </p>
      </div>
    </div>
  );
}

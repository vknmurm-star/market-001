import { adminEmail, sendMail } from "./mailer";
import { SITE_URL, SITE_NAME, formatPrice } from "./site";
import { PAYMENT_METHOD_LABELS, type Order } from "./types";

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html><html lang="ru"><body style="margin:0;background:#fdfbfa;font-family:Arial,Helvetica,sans-serif;color:#2b2226">
  <div style="max-width:600px;margin:0 auto;padding:24px">
    <div style="font-size:22px;font-weight:bold;color:#c9497a;margin-bottom:16px">${SITE_NAME}</div>
    <div style="background:#ffffff;border:1px solid #ece4e7;border-radius:16px;padding:24px">
      <h1 style="font-size:20px;margin:0 0 12px">${title}</h1>
      ${bodyHtml}
    </div>
    <div style="color:#7a6f74;font-size:12px;margin-top:16px">
      Это письмо отправлено магазином ${SITE_NAME} (${SITE_URL}).
      Демонстрационный проект — реальная оплата и доставка не производятся.
    </div>
  </div></body></html>`;
}

function itemsTable(order: Order): string {
  const rows = (order.items ?? [])
    .map(
      (i) =>
        `<tr>
          <td style="padding:6px 0;color:#2b2226">${i.name} × ${i.quantity}</td>
          <td style="padding:6px 0;text-align:right;white-space:nowrap">${formatPrice(
            i.price * i.quantity,
          )}</td>
        </tr>`,
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">
    ${rows}
    <tr><td colspan="2" style="border-top:1px solid #ece4e7;padding-top:8px"></td></tr>
    <tr>
      <td style="font-weight:bold">Итого</td>
      <td style="text-align:right;font-weight:bold">${formatPrice(order.total)}</td>
    </tr>
  </table>`;
}

export async function sendOrderConfirmation(order: Order): Promise<boolean> {
  const body = `
    <p>Спасибо за заказ! Мы приняли его в обработку.</p>
    <p style="font-size:15px">Номер заказа: <b style="color:#c9497a">${order.orderNumber}</b></p>
    ${itemsTable(order)}
    <p style="font-size:14px;color:#7a6f74;margin-top:16px">
      Способ оплаты: ${PAYMENT_METHOD_LABELS[order.paymentMethod]}<br/>
      ${order.address ? `Доставка: ${order.address}<br/>` : ""}
      Мы свяжемся с вами по телефону ${order.phone} для подтверждения.
    </p>
    <p style="margin-top:16px">
      <a href="${SITE_URL}/order/${encodeURIComponent(order.orderNumber)}"
         style="display:inline-block;background:#c9497a;color:#fff;text-decoration:none;padding:10px 20px;border-radius:999px">
        Посмотреть заказ
      </a>
    </p>`;
  return sendMail({
    to: order.email,
    subject: `Заказ ${order.orderNumber} принят — ${SITE_NAME}`,
    html: layout("Заказ оформлен", body),
    text: `Спасибо за заказ! Номер: ${order.orderNumber}. Сумма: ${formatPrice(
      order.total,
    )}. ${SITE_URL}/order/${order.orderNumber}`,
  });
}

export async function sendAdminNewOrder(order: Order): Promise<boolean> {
  const to = adminEmail();
  if (!to) return false;
  const body = `
    <p>Поступил новый заказ <b>${order.orderNumber}</b>.</p>
    <p style="font-size:14px">
      Покупатель: ${order.customerName}<br/>
      Телефон: ${order.phone}<br/>
      Email: ${order.email}<br/>
      ${order.address ? `Адрес: ${order.address}<br/>` : ""}
      Оплата: ${PAYMENT_METHOD_LABELS[order.paymentMethod]}
    </p>
    ${itemsTable(order)}
    <p style="margin-top:16px">
      <a href="${SITE_URL}/admin/orders"
         style="display:inline-block;background:#c9497a;color:#fff;text-decoration:none;padding:10px 20px;border-radius:999px">
        Открыть в админке
      </a>
    </p>`;
  return sendMail({
    to,
    subject: `Новый заказ ${order.orderNumber} — ${SITE_NAME}`,
    html: layout("Новый заказ", body),
  });
}

export async function sendWelcome(name: string, email: string): Promise<boolean> {
  const body = `
    <p>Здравствуйте${name ? `, ${name}` : ""}!</p>
    <p>Спасибо за регистрацию в магазине ${SITE_NAME}. Теперь ваши заказы
       сохраняются в личном кабинете, а оформлять покупки стало быстрее.</p>
    <p style="margin-top:16px">
      <a href="${SITE_URL}/catalog"
         style="display:inline-block;background:#c9497a;color:#fff;text-decoration:none;padding:10px 20px;border-radius:999px">
        Перейти в каталог
      </a>
    </p>`;
  return sendMail({
    to: email,
    subject: `Добро пожаловать в ${SITE_NAME}`,
    html: layout("Добро пожаловать!", body),
    text: `Спасибо за регистрацию в ${SITE_NAME}! Каталог: ${SITE_URL}/catalog`,
  });
}

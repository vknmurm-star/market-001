import { NextResponse } from "next/server";
import { createOrder, getOrderByNumber } from "@/lib/orders";
import { getCurrentUser } from "@/lib/userAuth";
import { sendOrderConfirmation, sendAdminNewOrder } from "@/lib/emails";
import { clientIp, maybeCleanup, rateLimit } from "@/lib/rateLimit";
import {
  DELIVERY_METHODS,
  type DeliveryMethod,
  type PaymentMethod,
} from "@/lib/types";

export const dynamic = "force-dynamic";

interface Body {
  customerName?: string;
  phone?: string;
  email?: string;
  address?: string;
  comment?: string;
  deliveryMethod?: string;
  paymentMethod?: string;
  website?: string; // honeypot — люди его не заполняют
  items?: { productId?: number; quantity?: number }[];
}

export async function POST(req: Request) {
  maybeCleanup();

  // Rate-limit: не более 5 оформлений за 10 минут с одного IP.
  const ip = clientIp(req.headers);
  const rl = rateLimit(`orders:${ip}`, 5, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Слишком много попыток. Попробуйте позже." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec ?? 60) } },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  // Honeypot: если скрытое поле заполнено — это бот, тихо отклоняем.
  if (body.website && body.website.trim() !== "") {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  // Если покупатель авторизован — заказ жёстко привязываем к email аккаунта
  // (не доверяем email из тела запроса).
  const sessionUser = await getCurrentUser();

  const name =
    (body.customerName ?? "").trim() || (sessionUser?.name ?? "");
  const phone = (body.phone ?? "").trim();
  const email = sessionUser?.email ?? (body.email ?? "").trim();
  const address = (body.address ?? "").trim();
  const paymentMethod: PaymentMethod =
    body.paymentMethod === "online" || body.paymentMethod === "sbp"
      ? body.paymentMethod
      : "cash";
  const deliveryMethod: DeliveryMethod = DELIVERY_METHODS.includes(
    body.deliveryMethod as DeliveryMethod,
  )
    ? (body.deliveryMethod as DeliveryMethod)
    : "cdek";

  if (!name || !phone || !email) {
    return NextResponse.json(
      { error: "Укажите имя, телефон и email" },
      { status: 400 },
    );
  }
  if (!/.+@.+\..+/.test(email)) {
    return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
  }

  const items = (body.items ?? [])
    .map((i) => ({
      productId: Number(i.productId),
      quantity: Number(i.quantity),
    }))
    .filter((i) => Number.isFinite(i.productId) && i.quantity > 0);

  if (items.length === 0) {
    return NextResponse.json({ error: "Корзина пуста" }, { status: 400 });
  }

  try {
    const result = createOrder({
      customerName: name,
      phone,
      email,
      address,
      comment: body.comment ?? "",
      deliveryMethod,
      paymentMethod,
      items,
    });
    // Тестовый режим ЮKassa: реальную транзакцию не проводим — заказ просто
    // фиксируется. Здесь была бы инициализация платежа при paymentMethod==="online".

    // Письма — best-effort, ошибки не влияют на успех заказа.
    const order = getOrderByNumber(result.orderNumber);
    if (order) {
      await Promise.allSettled([
        sendOrderConfirmation(order),
        sendAdminNewOrder(order),
      ]);
    }

    return NextResponse.json({
      ok: true,
      orderNumber: result.orderNumber,
      total: result.total,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ошибка оформления";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

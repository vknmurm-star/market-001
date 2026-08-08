import { NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";
import { getCurrentUser } from "@/lib/userAuth";
import type { PaymentMethod } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Body {
  customerName?: string;
  phone?: string;
  email?: string;
  address?: string;
  comment?: string;
  paymentMethod?: string;
  items?: { productId?: number; quantity?: number }[];
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
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
    body.paymentMethod === "online" ? "online" : "cash";

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
      paymentMethod,
      items,
    });
    // Тестовый режим ЮKassa: реальную транзакцию не проводим — заказ просто
    // фиксируется. Здесь была бы инициализация платежа при paymentMethod==="online".
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

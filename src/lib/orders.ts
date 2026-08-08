import { getDb } from "./db";
import { getProductsByIds } from "./catalog";
import type {
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
} from "./types";

export interface NewOrderInput {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  comment?: string;
  paymentMethod: PaymentMethod;
  items: { productId: number; quantity: number }[];
}

export interface CreatedOrder {
  orderNumber: string;
  total: number;
}

function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `MK-${y}-${rand}`;
}

/**
 * Создаёт заказ: серверная валидация корзины по актуальным ценам и остаткам,
 * запись order + order_items, списание остатков. Итог считается на сервере —
 * клиентским ценам не доверяем.
 */
export function createOrder(input: NewOrderInput): CreatedOrder {
  const db = getDb();

  const ids = input.items.map((i) => i.productId);
  const products = getProductsByIds(ids);
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines = input.items
    .map((i) => {
      const p = byId.get(i.productId);
      if (!p) return null;
      const qty = Math.max(1, Math.min(i.quantity, p.stock));
      if (qty <= 0) return null;
      return { product: p, quantity: qty };
    })
    .filter((l): l is { product: (typeof products)[number]; quantity: number } => l !== null);

  if (lines.length === 0) {
    throw new Error("Корзина пуста или товары недоступны");
  }

  const total = lines.reduce((s, l) => s + l.product.price * l.quantity, 0);

  // привязка к пользователю по email (упрощённая авторизация)
  const upsertUser = db.prepare(
    `INSERT INTO users (email, name) VALUES (?, ?)
     ON CONFLICT(email) DO UPDATE SET name = excluded.name
     WHERE excluded.name != ''`,
  );
  const getUser = db.prepare(`SELECT id FROM users WHERE email = ?`);

  const insertOrder = db.prepare(
    `INSERT INTO orders
       (order_number, user_id, customer_name, phone, email, address, comment, payment_method, status, total)
     VALUES (@orderNumber, @userId, @customerName, @phone, @email, @address, @comment, @paymentMethod, 'new', @total)`,
  );
  const insertItem = db.prepare(
    `INSERT INTO order_items (order_id, product_id, sku, name, price, quantity)
     VALUES (@orderId, @productId, @sku, @name, @price, @quantity)`,
  );
  const decStock = db.prepare(
    `UPDATE products SET stock = MAX(0, stock - @qty), popularity = popularity + @qty WHERE id = @id`,
  );

  const orderNumber = generateOrderNumber();

  db.exec("BEGIN");
  try {
    upsertUser.run(input.email.trim().toLowerCase(), input.customerName.trim());
    const user = getUser.get(input.email.trim().toLowerCase()) as unknown as
      | { id: number }
      | undefined;

    const res = insertOrder.run({
      orderNumber,
      userId: user?.id ?? null,
      customerName: input.customerName.trim(),
      phone: input.phone.trim(),
      email: input.email.trim().toLowerCase(),
      address: input.address.trim(),
      comment: (input.comment ?? "").trim(),
      paymentMethod: input.paymentMethod,
      total,
    });
    const orderId = Number(res.lastInsertRowid);

    for (const l of lines) {
      insertItem.run({
        orderId,
        productId: l.product.id,
        sku: l.product.sku,
        name: l.product.name,
        price: l.product.price,
        quantity: l.quantity,
      });
      decStock.run({ qty: l.quantity, id: l.product.id });
    }

    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }

  return { orderNumber, total };
}

interface OrderRow {
  id: number;
  order_number: string;
  user_id: number | null;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  comment: string;
  payment_method: PaymentMethod;
  status: OrderStatus;
  total: number;
  created_at: string;
}

interface OrderItemRow {
  id: number;
  order_id: number;
  product_id: number | null;
  sku: string;
  name: string;
  price: number;
  quantity: number;
}

function mapOrder(r: OrderRow): Order {
  return {
    id: r.id,
    orderNumber: r.order_number,
    userId: r.user_id,
    customerName: r.customer_name,
    phone: r.phone,
    email: r.email,
    address: r.address,
    comment: r.comment,
    paymentMethod: r.payment_method,
    status: r.status,
    total: r.total,
    createdAt: r.created_at,
  };
}

function getItemsFor(orderId: number): OrderItem[] {
  const rows = getDb()
    .prepare(`SELECT * FROM order_items WHERE order_id = ?`)
    .all(orderId) as unknown as OrderItemRow[];
  return rows.map((r) => ({
    id: r.id,
    orderId: r.order_id,
    productId: r.product_id,
    sku: r.sku,
    name: r.name,
    price: r.price,
    quantity: r.quantity,
  }));
}

export function getOrderByNumber(orderNumber: string): Order | null {
  const row = getDb()
    .prepare(`SELECT * FROM orders WHERE order_number = ?`)
    .get(orderNumber) as unknown as OrderRow | undefined;
  if (!row) return null;
  const order = mapOrder(row);
  order.items = getItemsFor(order.id);
  return order;
}

export function getOrdersByEmail(email: string): Order[] {
  const rows = getDb()
    .prepare(`SELECT * FROM orders WHERE email = ? ORDER BY created_at DESC, id DESC`)
    .all(email.trim().toLowerCase()) as unknown as OrderRow[];
  return rows.map((r) => {
    const o = mapOrder(r);
    o.items = getItemsFor(o.id);
    return o;
  });
}

export function getAllOrders(): Order[] {
  const rows = getDb()
    .prepare(`SELECT * FROM orders ORDER BY created_at DESC, id DESC`)
    .all() as unknown as OrderRow[];
  return rows.map((r) => {
    const o = mapOrder(r);
    o.items = getItemsFor(o.id);
    return o;
  });
}

export function updateOrderStatus(orderNumber: string, status: OrderStatus): void {
  getDb()
    .prepare(`UPDATE orders SET status = ? WHERE order_number = ?`)
    .run(status, orderNumber);
}

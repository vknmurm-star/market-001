export interface Category {
  id: number;
  slug: string;
  name: string;
  sort: number;
}

export interface Product {
  id: number;
  sku: string;
  slug: string;
  name: string;
  categoryId: number;
  categorySlug: string;
  categoryName: string;
  price: number;
  oldPrice: number | null;
  description: string;
  stock: number;
  image: string | null;
  popularity: number;
  createdAt: string;
}

export type OrderStatus = "new" | "processing" | "done";

export type PaymentMethod = "online" | "cash";

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number | null;
  sku: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number | null;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  comment: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items?: OrderItem[];
}

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Новый",
  processing: "В обработке",
  done: "Выполнен",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  online: "Онлайн-оплата (ЮKassa, тестовый режим)",
  cash: "При получении",
};

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthed, signInAdmin, signOutAdmin } from "@/lib/adminAuth";
import {
  createProduct,
  deleteProduct,
  saveUploadedImage,
  updateProduct,
  type ProductInput,
} from "@/lib/adminData";
import { updateOrderStatus } from "@/lib/orders";
import type { OrderStatus } from "@/lib/types";

async function ensureAuthed() {
  if (!(await isAdminAuthed())) {
    throw new Error("Требуется авторизация администратора");
  }
}

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const ok = await signInAdmin(password);
  if (!ok) {
    redirect("/admin/login?error=1");
  }
  redirect("/admin");
}

export async function logoutAction() {
  await signOutAdmin();
  redirect("/admin/login");
}

function parseProduct(formData: FormData): ProductInput {
  const oldPriceRaw = String(formData.get("oldPrice") ?? "").trim();
  return {
    sku: String(formData.get("sku") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    categoryId: Number(formData.get("categoryId")),
    price: Math.max(0, Math.round(Number(formData.get("price")))),
    oldPrice: oldPriceRaw ? Math.round(Number(oldPriceRaw)) : null,
    description: String(formData.get("description") ?? "").trim(),
    stock: Math.max(0, Math.round(Number(formData.get("stock")))),
    image: String(formData.get("image") ?? "").trim() || null,
  };
}

/** Если админ загрузил файл — сохраняем его и подменяем путь к изображению. */
async function applyUploadedImage(formData: FormData, input: ProductInput) {
  const file = formData.get("imageFile");
  if (file instanceof File && file.size > 0) {
    const saved = await saveUploadedImage(file, input.sku);
    if (saved) input.image = saved;
  }
}

export async function createProductAction(formData: FormData) {
  await ensureAuthed();
  const input = parseProduct(formData);
  await applyUploadedImage(formData, input);
  createProduct(input);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateProductAction(formData: FormData) {
  await ensureAuthed();
  const id = Number(formData.get("id"));
  const input = parseProduct(formData);
  await applyUploadedImage(formData, input);
  updateProduct(id, input);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteProductAction(formData: FormData) {
  await ensureAuthed();
  const id = Number(formData.get("id"));
  deleteProduct(id);
  revalidatePath("/admin");
}

export async function setOrderStatusAction(formData: FormData) {
  await ensureAuthed();
  const orderNumber = String(formData.get("orderNumber") ?? "");
  const status = String(formData.get("status") ?? "new") as OrderStatus;
  updateOrderStatus(orderNumber, status);
  revalidatePath("/admin/orders");
}

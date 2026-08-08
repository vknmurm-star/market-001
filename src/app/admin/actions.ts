"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthed, signInAdmin, signOutAdmin } from "@/lib/adminAuth";
import {
  addProductImage,
  countProductImages,
  createProduct,
  deleteProduct,
  deleteProductImage,
  MAX_PRODUCT_IMAGES,
  reorderProductImages,
  saveUploadedImage,
  syncMainImage,
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

/**
 * Сохраняет загруженные файлы в галерею товара, не превышая лимит
 * MAX_PRODUCT_IMAGES (лишние файлы игнорируются).
 */
async function saveUploadedGallery(
  formData: FormData,
  productId: number,
  sku: string,
) {
  let slots = MAX_PRODUCT_IMAGES - countProductImages(productId);
  if (slots <= 0) return;
  const files = formData.getAll("imageFile");
  for (const file of files) {
    if (slots <= 0) break;
    if (file instanceof File && file.size > 0) {
      const saved = await saveUploadedImage(file, sku);
      if (saved) {
        addProductImage(productId, saved);
        slots--;
      }
    }
  }
}

/** Порядок изображений из скрытого поля imageOrder (список id через запятую). */
function applyImageOrder(formData: FormData, productId: number) {
  const raw = String(formData.get("imageOrder") ?? "").trim();
  if (!raw) return;
  const ids = raw
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n > 0);
  if (ids.length) reorderProductImages(productId, ids);
}

export async function createProductAction(formData: FormData) {
  await ensureAuthed();
  const input = parseProduct(formData);
  const id = createProduct(input);
  await saveUploadedGallery(formData, id, input.sku);
  syncMainImage(id);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateProductAction(formData: FormData) {
  await ensureAuthed();
  const id = Number(formData.get("id"));
  const input = parseProduct(formData);
  updateProduct(id, input);

  // удаление отмеченных изображений (вместе с файлами на диске)
  for (const raw of formData.getAll("deleteImage")) {
    const imgId = Number(raw);
    if (Number.isInteger(imgId)) deleteProductImage(imgId);
  }
  // порядок оставшихся
  applyImageOrder(formData, id);
  // добавление новых загруженных (в пределах лимита)
  await saveUploadedGallery(formData, id, input.sku);

  syncMainImage(id);
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

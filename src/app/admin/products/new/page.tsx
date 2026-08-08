import { requireAdmin } from "@/lib/adminAuth";
import { getCategories } from "@/lib/catalog";
import ProductForm from "../../ProductForm";
import { createProductAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin();
  const categories = getCategories();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Новый товар</h1>
      <ProductForm categories={categories} action={createProductAction} />
    </div>
  );
}

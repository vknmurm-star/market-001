import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuth";
import { getCategories, getProductById } from "@/lib/catalog";
import { getProductImages } from "@/lib/adminData";
import ProductForm from "../../ProductForm";
import { updateProductAction } from "../../actions";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function EditProductPage({ params }: { params: Params }) {
  await requireAdmin();
  const { id } = await params;
  const product = getProductById(Number(id));
  if (!product) notFound();
  const categories = getCategories();
  const images = getProductImages(product.id);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">
        Редактирование: {product.name}
      </h1>
      <ProductForm
        categories={categories}
        action={updateProductAction}
        product={product}
        images={images}
      />
    </div>
  );
}

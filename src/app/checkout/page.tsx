import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/userAuth";
import CheckoutForm from "./CheckoutForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Оформление заказа",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  return (
    <CheckoutForm
      initialName={user?.name ?? ""}
      initialEmail={user?.email ?? ""}
      isAuthed={!!user}
    />
  );
}

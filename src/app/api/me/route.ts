import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/userAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json(
    user ? { user: { name: user.name, email: user.email } } : { user: null },
    { headers: { "Cache-Control": "no-store" } },
  );
}

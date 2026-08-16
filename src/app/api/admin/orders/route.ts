import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAllOrdersAdmin } from "@/lib/data";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const orders = await getAllOrdersAdmin();
  return NextResponse.json({ orders });
}

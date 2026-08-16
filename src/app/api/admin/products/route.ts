import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAllProductsAdmin } from "@/lib/data";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const status = req.nextUrl.searchParams.get("status") as "pending" | "approved" | "rejected" | null;
  const products = await getAllProductsAdmin(status || undefined);
  return NextResponse.json({ products });
}

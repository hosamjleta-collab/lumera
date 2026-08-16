import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAllSuppliers } from "@/lib/data";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const suppliers = await getAllSuppliers();
  return NextResponse.json({ suppliers });
}

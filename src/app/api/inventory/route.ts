import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const warehouseId = searchParams.get("warehouseId") || "";
  const locationId = searchParams.get("locationId") || "";
  const alert = searchParams.get("alert") || "";

  const where: Record<string, string> = {};
  if (warehouseId) where.warehouseId = warehouseId;
  if (locationId) where.locationId = locationId;

  const inventory = await prisma.inventory.findMany({
    where,
    include: {
      product: { include: { category: true } },
      warehouse: true,
      location: true,
    },
    orderBy: { product: { name: "asc" } },
  });

  // Apply product name search and alert filters in memory (simpler for SQLite)
  let filtered = inventory;
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (i) => i.product.name.toLowerCase().includes(s) || i.product.code.toLowerCase().includes(s)
    );
  }
  if (alert === "low") {
    filtered = filtered.filter((i) => i.quantity <= i.product.minStock && i.product.minStock > 0);
  } else if (alert === "high") {
    filtered = filtered.filter((i) => i.quantity >= i.product.maxStock && i.product.maxStock > 0);
  }

  return NextResponse.json({ success: true, data: filtered });
}

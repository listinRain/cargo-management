export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const inventory = await prisma.inventory.findMany({
    include: { product: true, warehouse: true, location: true },
  });

  const lowStock = inventory.filter(
    (i) => i.quantity <= i.product.minStock && i.product.minStock > 0
  );
  const overstock = inventory.filter(
    (i) => i.quantity >= i.product.maxStock && i.product.maxStock > 0
  );

  return NextResponse.json({
    success: true,
    data: { lowStock, overstock, lowStockCount: lowStock.length, overstockCount: overstock.length },
  });
}

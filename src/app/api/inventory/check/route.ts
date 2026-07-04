export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  const [data, total] = await Promise.all([
    prisma.inventoryCheck.findMany({
      include: { warehouse: true, handler: { select: { name: true } }, _count: { select: { items: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.inventoryCheck.count(),
  ]);

  return NextResponse.json({
    success: true, data,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireWriteAccess();
  if (error) return error;

  const body = await req.json();
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 4).toUpperCase();
  const checkNo = `CHK-${dateStr}-${suffix}`;

  // Get all inventory for this warehouse
  const inventory = await prisma.inventory.findMany({
    where: { warehouseId: body.warehouseId },
    include: { product: true, location: true },
  });

  const check = await prisma.inventoryCheck.create({
    data: {
      checkNo,
      warehouseId: body.warehouseId,
      handlerId: session.user.id,
      checkDate: body.checkDate ? new Date(body.checkDate) : new Date(),
      remark: body.remark || null,
      items: {
        create: inventory.map((inv) => ({
          productId: inv.productId,
          locationId: inv.locationId,
          bookQuantity: inv.quantity,
          actualQuantity: 0,
          difference: 0,
        })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json({ success: true, data: check });
}

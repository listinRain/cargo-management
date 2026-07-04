import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  const where: any = {};
  if (status) where.status = status;

  const [data, total] = await Promise.all([
    prisma.inboundOrder.findMany({
      where,
      include: { supplier: { select: { name: true } }, handler: { select: { name: true } }, _count: { select: { items: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.inboundOrder.count({ where }),
  ]);

  return NextResponse.json({ success: true, data, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireWriteAccess();
  if (error) return error;

  const body = await req.json();
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 4).toUpperCase();
  const orderNo = `INB-${dateStr}-${suffix}`;

  const order = await prisma.inboundOrder.create({
    data: {
      orderNo,
      type: body.type || "PURCHASE",
      supplierId: body.supplierId || null,
      handlerId: session.user.id,
      inboundDate: body.inboundDate ? new Date(body.inboundDate) : new Date(),
      remark: body.remark || null,
      items: {
        create: (body.items || []).map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice || 0,
          totalPrice: (item.quantity || 0) * (item.unitPrice || 0),
          warehouseId: item.warehouseId,
          locationId: item.locationId,
        })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json({ success: true, data: order });
}

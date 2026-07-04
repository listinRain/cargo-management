export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/auth-utils";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const order = await prisma.inboundOrder.findUnique({
    where: { id: params.id },
    include: {
      supplier: true, handler: { select: { name: true } },
      items: { include: { product: true, warehouse: true, location: true } },
    },
  });
  if (!order) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: order });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireWriteAccess();
  if (error) return error;

  const body = await req.json();
  await prisma.inboundOrder.update({
    where: { id: params.id },
    data: { type: body.type, supplierId: body.supplierId, remark: body.remark },
  });
  return NextResponse.json({ success: true, message: "Updated" });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireWriteAccess();
  if (error) return error;
  await prisma.inboundOrder.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true, message: "Deleted" });
}

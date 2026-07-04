export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/auth-utils";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireWriteAccess();
  if (error) return error;

  const body = await req.json();
  const location = await prisma.location.update({
    where: { id: params.id },
    data: { name: body.name, code: body.code, warehouseId: body.warehouseId },
  });
  return NextResponse.json({ success: true, data: location });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireWriteAccess();
  if (error) return error;

  const count = await prisma.inventory.count({ where: { locationId: params.id } });
  if (count > 0) {
    return NextResponse.json({ success: false, error: "该库位下还有库存，无法删除" }, { status: 400 });
  }
  await prisma.location.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true, message: "Deleted" });
}

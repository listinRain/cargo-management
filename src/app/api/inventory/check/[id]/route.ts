export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/auth-utils";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const check = await prisma.inventoryCheck.findUnique({
    where: { id: params.id },
    include: {
      warehouse: true,
      handler: { select: { name: true } },
      items: { include: { product: true, location: true } },
    },
  });
  if (!check) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: check });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireWriteAccess();
  if (error) return error;

  const body = await req.json();
  if (body.items) {
    for (const item of body.items) {
      if (item.id && item.actualQuantity !== undefined) {
        const diff = item.actualQuantity - (await prisma.inventoryCheckItem.findUnique({ where: { id: item.id } }))!.bookQuantity;
        await prisma.inventoryCheckItem.update({
          where: { id: item.id },
          data: { actualQuantity: item.actualQuantity, difference: diff },
        });
      }
    }
  }
  return NextResponse.json({ success: true, message: "Updated" });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireWriteAccess();
  if (error) return error;
  await prisma.inventoryCheck.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true, message: "Deleted" });
}

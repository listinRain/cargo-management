import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/auth-utils";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const warehouse = await prisma.warehouse.findUnique({
    where: { id: params.id },
    include: { locations: true },
  });
  if (!warehouse) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: warehouse });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireWriteAccess();
  if (error) return error;

  const body = await req.json();
  const warehouse = await prisma.warehouse.update({
    where: { id: params.id },
    data: { name: body.name, code: body.code, address: body.address, manager: body.manager },
  });
  return NextResponse.json({ success: true, data: warehouse });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireWriteAccess();
  if (error) return error;
  await prisma.warehouse.update({ where: { id: params.id }, data: { status: "INACTIVE" } });
  return NextResponse.json({ success: true, message: "Deleted" });
}

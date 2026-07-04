export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/auth-utils";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireWriteAccess();
  if (error) return error;
  const body = await req.json();
  const data = await prisma.supplier.update({ where: { id: params.id }, data: { name: body.name, code: body.code, contactPerson: body.contactPerson, phone: body.phone, email: body.email } });
  return NextResponse.json({ success: true, data });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireWriteAccess();
  if (error) return error;
  await prisma.supplier.update({ where: { id: params.id }, data: { status: "INACTIVE" } });
  return NextResponse.json({ success: true });
}

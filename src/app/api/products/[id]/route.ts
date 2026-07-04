export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/auth-utils";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      inventory: { include: { warehouse: true, location: true } },
    },
  });
  if (!product) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: product });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireWriteAccess();
  if (error) return error;

  const body = await req.json();
  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      name: body.name,
      code: body.code,
      specification: body.specification,
      unit: body.unit,
      unitPrice: body.unitPrice,
      categoryId: body.categoryId,
      minStock: body.minStock,
      maxStock: body.maxStock,
      remark: body.remark,
      imageUrl: body.imageUrl,
      barcode: body.barcode,
    },
  });
  return NextResponse.json({ success: true, data: product });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireWriteAccess();
  if (error) return error;

  await prisma.product.update({
    where: { id: params.id },
    data: { status: "DISCONTINUED" },
  });
  return NextResponse.json({ success: true, message: "Deleted" });
}

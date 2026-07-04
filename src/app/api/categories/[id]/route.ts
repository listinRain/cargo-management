import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/auth-utils";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const category = await prisma.category.findUnique({
    where: { id: params.id },
    include: { children: true, _count: { select: { products: true } } },
  });
  if (!category) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: category });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireWriteAccess();
  if (error) return error;

  const body = await req.json();
  const category = await prisma.category.update({
    where: { id: params.id },
    data: {
      name: body.name,
      code: body.code,
      parentId: body.parentId,
      sortOrder: body.sortOrder,
    },
  });
  return NextResponse.json({ success: true, data: category });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireWriteAccess();
  if (error) return error;

  const category = await prisma.category.findUnique({
    where: { id: params.id },
    include: { _count: { select: { children: true, products: true } } },
  });
  if (!category) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  if (category._count.children > 0 || category._count.products > 0) {
    return NextResponse.json({ success: false, error: "该分类下有子分类或货物，无法删除" }, { status: 400 });
  }
  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true, message: "Deleted" });
}

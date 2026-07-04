import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const status = searchParams.get("status") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" as const } },
      { code: { contains: search, mode: "insensitive" as const } },
    ];
  }
  if (categoryId) where.categoryId = categoryId;
  if (status) where.status = status;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: where as any,
      include: {
        category: true,
        inventory: { include: { warehouse: true, location: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where: where as any }),
  ]);

  return NextResponse.json({
    success: true,
    data: products,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireWriteAccess();
  if (error) return error;

  const body = await req.json();
  const product = await prisma.product.create({
    data: {
      name: body.name,
      code: body.code,
      specification: body.specification || null,
      unit: body.unit || "pcs",
      unitPrice: body.unitPrice || 0,
      categoryId: body.categoryId || null,
      minStock: body.minStock || 0,
      maxStock: body.maxStock || 0,
      remark: body.remark || null,
      imageUrl: body.imageUrl || null,
      barcode: body.barcode || null,
    },
  });
  return NextResponse.json({ success: true, data: product });
}

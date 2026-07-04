import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/auth-utils";

export async function GET() {
  // 返回平铺列表，前端自己构建树（避免 Prisma include children 导致的重复问题）
  const categories = await prisma.category.findMany({
    orderBy: [{ level: "asc" }, { sortOrder: "asc" }],
    include: {
      _count: { select: { products: true } },
    },
  });
  return NextResponse.json({ success: true, data: categories });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireWriteAccess();
  if (error) return error;

  const body = await req.json();
  const category = await prisma.category.create({
    data: {
      name: body.name,
      code: body.code || null,
      parentId: body.parentId || null,
      level: body.parentId ? 2 : 1,
      sortOrder: body.sortOrder || 0,
    },
  });
  return NextResponse.json({ success: true, data: category });
}

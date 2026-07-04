export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "50");

  const where: any = {};
  if (type) where.type = type;

  const [data, total] = await Promise.all([
    prisma.transactionLog.findMany({
      where,
      include: { product: { select: { name: true, code: true, unit: true } }, warehouse: { select: { name: true } }, location: { select: { name: true } }, operator: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.transactionLog.count({ where }),
  ]);

  return NextResponse.json({ success: true, data, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
}

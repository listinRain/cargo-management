import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/auth-utils";

export async function GET() {
  const warehouses = await prisma.warehouse.findMany({
    include: { _count: { select: { locations: true, inventory: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, data: warehouses });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireWriteAccess();
  if (error) return error;

  const body = await req.json();
  const warehouse = await prisma.warehouse.create({
    data: { name: body.name, code: body.code, address: body.address || null, manager: body.manager || null },
  });
  return NextResponse.json({ success: true, data: warehouse });
}

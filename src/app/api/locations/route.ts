export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const warehouseId = searchParams.get("warehouseId");
  const where = warehouseId ? { warehouseId } : {};
  const locations = await prisma.location.findMany({
    where,
    include: { warehouse: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, data: locations });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireWriteAccess();
  if (error) return error;

  const body = await req.json();
  const location = await prisma.location.create({
    data: { name: body.name, code: body.code, warehouseId: body.warehouseId },
  });
  return NextResponse.json({ success: true, data: location });
}

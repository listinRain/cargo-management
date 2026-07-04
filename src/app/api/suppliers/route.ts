export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/auth-utils";

export async function GET() {
  const data = await prisma.supplier.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ success: true, data });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireWriteAccess();
  if (error) return error;
  const body = await req.json();
  const data = await prisma.supplier.create({ data: { name: body.name, code: body.code, contactPerson: body.contactPerson, phone: body.phone, email: body.email } });
  return NextResponse.json({ success: true, data });
}

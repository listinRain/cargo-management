import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/auth-utils";

export async function GET() { return NextResponse.json({ success: true, data: await prisma.customer.findMany({ orderBy: { createdAt: "desc" } }) }); }
export async function POST(req: NextRequest) {
  const { session, error } = await requireWriteAccess();
  if (error) return error;
  const body = await req.json();
  const data = await prisma.customer.create({ data: { name: body.name, code: body.code, contactPerson: body.contactPerson, phone: body.phone, email: body.email } });
  return NextResponse.json({ success: true, data });
}

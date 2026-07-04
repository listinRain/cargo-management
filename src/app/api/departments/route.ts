export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/auth-utils";

export async function GET() { return NextResponse.json({ success: true, data: await prisma.department.findMany({ orderBy: { createdAt: "desc" } }) }); }
export async function POST(req: NextRequest) {
  const { session, error } = await requireWriteAccess();
  if (error) return error;
  const body = await req.json();
  const data = await prisma.department.create({ data: { name: body.name, code: body.code, description: body.description } });
  return NextResponse.json({ success: true, data });
}

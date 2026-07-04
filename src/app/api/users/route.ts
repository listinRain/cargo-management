export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/auth-utils";
import bcrypt from "bcryptjs";

export async function GET() {
  const { error } = await requireAdminAccess();
  if (error) return error;

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, phone: true, status: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, data: users });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdminAccess();
  if (error) return error;

  const body = await req.json();
  const hashed = await bcrypt.hash(body.password || "123456", 12);
  const user = await prisma.user.create({
    data: { name: body.name, email: body.email, password: hashed, role: body.role || "VIEWER", phone: body.phone },
    select: { id: true, name: true, email: true, role: true, status: true },
  });
  return NextResponse.json({ success: true, data: user });
}

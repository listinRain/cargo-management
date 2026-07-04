export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, name: true, email: true, role: true, phone: true } });
  return NextResponse.json({ success: true, data: user });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (body.changePassword && body.newPassword) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const valid = await bcrypt.compare(body.currentPassword || "", user!.password);
    if (!valid) return NextResponse.json({ success: false, error: "当前密码错误" }, { status: 400 });
    const hashed = await bcrypt.hash(body.newPassword, 12);
    await prisma.user.update({ where: { id: session.user.id }, data: { password: hashed } });
    return NextResponse.json({ success: true, message: "密码已更新" });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: body.name, phone: body.phone },
  });
  return NextResponse.json({ success: true, message: "已更新" });
}

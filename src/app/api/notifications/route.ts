import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ success: true, data: notifications });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (body.markAllRead) {
    await prisma.notification.updateMany({ where: { userId: session.user.id, isRead: false }, data: { isRead: true } });
  } else if (body.id) {
    await prisma.notification.update({ where: { id: body.id }, data: { isRead: true } });
  }
  return NextResponse.json({ success: true });
}

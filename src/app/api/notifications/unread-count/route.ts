import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const count = await prisma.notification.count({ where: { userId: session.user.id, isRead: false } });
  return NextResponse.json({ success: true, data: { count } });
}

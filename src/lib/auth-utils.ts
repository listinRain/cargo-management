import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

/**
 * 检查写权限（仓管员或管理员）。
 * 未登录返回 401，权限不足返回 403，通过返回 session。
 */
export async function requireWriteAccess() {
  const session = await getSession();
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ success: false, error: "请先登录" }, { status: 401 }),
    };
  }
  if (!["ADMIN", "WAREHOUSE_MANAGER"].includes(session.user.role)) {
    return {
      session: null,
      error: NextResponse.json({ success: false, error: "权限不足" }, { status: 403 }),
    };
  }
  return { session, error: null };
}

/**
 * 检查管理员权限。
 * 未登录返回 401，非管理员返回 403，通过返回 session。
 */
export async function requireAdminAccess() {
  const session = await getSession();
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ success: false, error: "请先登录" }, { status: 401 }),
    };
  }
  if (session.user.role !== "ADMIN") {
    return {
      session: null,
      error: NextResponse.json({ success: false, error: "权限不足" }, { status: 403 }),
    };
  }
  return { session, error: null };
}

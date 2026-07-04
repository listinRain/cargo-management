import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";

export type ApiHandler<T = unknown> = (
  req: Request,
  context: { params: T },
  session: NonNullable<Awaited<ReturnType<typeof getServerSession>>>
) => Promise<Response> | Response;

/**
 * 需要登录才能访问的 API 处理。
 * 未登录返回 401。
 */
export function withAuth<T = unknown>(handler: ApiHandler<T>) {
  return async (req: Request, context: { params: T }) => {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 }
      );
    }
    return handler(req, context, session);
  };
}

/**
 * 需要特定角色才能访问的 API 处理。
 * 未登录返回 401，角色不足返回 403。
 */
export function withRole<T = unknown>(roles: string[], handler: ApiHandler<T>) {
  return async (req: Request, context: { params: T }) => {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 }
      );
    }
    if (!roles.includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "权限不足" },
        { status: 403 }
      );
    }
    return handler(req, context, session);
  };
}

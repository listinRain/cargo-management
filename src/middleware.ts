import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // 如果 token 存在但 API 返回了 401（token 过期/无效），
    // 对 API 请求返回 JSON 而非重定向
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const isApi = req.nextUrl.pathname.startsWith("/api/");

        if (!token) {
          // API 请求返回 JSON 401，页面请求由框架重定向到 /login
          if (isApi) {
            return false; // next-auth 会返回 JSON
          }
          return false;
        }

        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/((?!api/auth|login|register|_next/static|_next/image|favicon.ico).*)",
  ],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "accessToken";

const PUBLIC_ROUTES = new Set(["/", "/login"]);
const PUBLIC_API_PREFIXES = ["/api/auth/login", "/api/feedbacks", "/api/branches"];
const STATIC_PREFIXES = ["/_next", "/favicon.ico", "/logo.png", "/assets", "/logo"];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.has(pathname)) return true;
  return PUBLIC_API_PREFIXES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

function isStaticAsset(pathname: string): boolean {
  return STATIC_PREFIXES.some((r) => pathname.startsWith(r));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicRoute(pathname) || isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete(SESSION_COOKIE);
      return response;
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-auth-token-present", "1");
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png).*)",
  ],
};

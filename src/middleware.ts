import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "accessToken"; // Express backend sets this cookie

const PUBLIC_ROUTES = ["/login", "/api/auth/login", "/api/feedbacks", "/api/branches"];
const STATIC_ROUTES = ["/_next", "/favicon", "/assets", "/logo"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/" ||
    PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/")) ||
    STATIC_ROUTES.some((r) => pathname.startsWith(r))
  ) {
    return NextResponse.next();
  }

  // Protect Dashboard Routes
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    
    // If no access token exists, redirect to login
    if (!token) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete(SESSION_COOKIE);
      return response;
    }

    // Since the actual JWT validation is handled by the Express API on every data request,
    // we simply allow the page load if the cookie is present. If the cookie is expired/invalid,
    // the API requests on the dashboard will fail (401) and we should handle that in the UI.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png).*)",
  ],
};

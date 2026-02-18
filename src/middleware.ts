import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token");
  const { pathname } = request.nextUrl;

  // Protect /dashboard
  if (pathname.startsWith("/dashboard")) {
    if (!sessionToken) {
      // Not logged in, redirect to login
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = request.cookies.get("user_role")?.value;

    // RBAC: Admin cannot access users management and settings
    if (userRole === "Admin") {
      if (
        pathname.startsWith("/dashboard/users") ||
        pathname.startsWith("/dashboard/settings")
      ) {
        const dashboardUrl = new URL("/dashboard", request.url);
        return NextResponse.redirect(dashboardUrl);
      }
    }
  }

  // Redirect logged in users away from login/register
  if (pathname === "/login" || pathname === "/register") {
    if (sessionToken) {
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};

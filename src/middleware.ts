import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token");
  const { pathname } = request.nextUrl;

  // Protect /dashboard
  if (pathname.startsWith("/dashboard")) {
    if (!sessionToken) {
      // Not logged in, redirect to landing page
      const landingUrl = new URL("/", request.url);
      return NextResponse.redirect(landingUrl);
    }

    const userRole = request.cookies.get("user_role")?.value;

    // RBAC: Admin and Farmasi can only access dashboard and schedule
    if (userRole === "Admin" || userRole === "Farmasi") {
      const allowedPaths = ["/dashboard", "/dashboard/schedule"];
      // If the current path is NOT an allowed path and NOT a subpath of an allowed path (except /dashboard itself which should match exactly or be /dashboard/schedule)
      // Actually simpler: if it starts with restricted paths or isn't starting with allowed ones.
      // Let's use a clear check:
      const isAllowed = allowedPaths.some(
        (path) => pathname === path || pathname.startsWith(path + "/"),
      );

      if (!isAllowed) {
        const dashboardUrl = new URL("/dashboard", request.url);
        return NextResponse.redirect(dashboardUrl);
      }
    }
  }

  // Disable public registration and legacy login
  if (pathname === "/register" || pathname === "/login") {
    const landingUrl = new URL("/", request.url);
    return NextResponse.redirect(landingUrl);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};

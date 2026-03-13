import { auth } from "@/lib/auth/auth";
import { DEMO_COOKIE_NAME, isDemoCookieValue, isPublicDemoEnabled } from "@/lib/demo";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isDemo =
    isPublicDemoEnabled() &&
    isDemoCookieValue(req.cookies.get(DEMO_COOKIE_NAME)?.value);
  const user = req.auth?.user;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute =
    nextUrl.pathname === "/" ||
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register") ||
    nextUrl.pathname.startsWith("/forgot-password") ||
    nextUrl.pathname.startsWith("/reset-password") ||
    nextUrl.pathname.startsWith("/invite") ||
    nextUrl.pathname.startsWith("/terms") ||
    nextUrl.pathname.startsWith("/privacy") ||
    nextUrl.pathname.startsWith("/api/demo/session") ||
    nextUrl.pathname.startsWith("/api/webhooks") ||
    nextUrl.pathname === "/api/health";

  const isApiRoute = nextUrl.pathname.startsWith("/api");

  if (isApiAuthRoute || isPublicRoute) {
    return NextResponse.next();
  }

  if (isDemo && !isApiRoute) {
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isLoggedIn && user && !isApiRoute) {
    const pathname = nextUrl.pathname;
    const role = user.role;

    if (role === "TECHNICIAN") {
      const allowedRoutes = ["/jobs", "/schedule", "/profile"];
      const isAllowed = allowedRoutes.some((route) => pathname.startsWith(route));

      if (!isAllowed && pathname !== "/dashboard") {
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
      }
    }

    if (role === "ACCOUNTANT") {
      const allowedRoutes = ["/invoices", "/estimates", "/reports", "/payments"];
      const isAllowed = allowedRoutes.some((route) => pathname.startsWith(route));

      if (!isAllowed && pathname !== "/dashboard") {
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};

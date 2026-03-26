import { auth } from "@/lib/auth/auth";
import { DEMO_COOKIE_NAME, getDemoRoleFromCookie, isPublicDemoEnabled } from "@/lib/demo";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const demoRole = isPublicDemoEnabled()
    ? getDemoRoleFromCookie(req.cookies.get(DEMO_COOKIE_NAME)?.value)
    : null;
  const isDemo = Boolean(demoRole);
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

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  const effectiveRole = user?.role ?? demoRole;

  if (effectiveRole && !isApiRoute) {
    const pathname = nextUrl.pathname;
    const role = effectiveRole;

    if (role === "TECHNICIAN") {
      const allowedRoutes = ["/jobs", "/calendar", "/profile"];
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

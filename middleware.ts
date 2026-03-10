import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = 
    nextUrl.pathname === "/" ||
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register") ||
    nextUrl.pathname.startsWith("/forgot-password") ||
    nextUrl.pathname.startsWith("/reset-password") ||
    nextUrl.pathname.startsWith("/invite") ||
    nextUrl.pathname.startsWith("/api/webhooks") ||
    nextUrl.pathname === "/api/health";

  const isApiRoute = nextUrl.pathname.startsWith("/api");

  // Allow API auth routes and public routes
  if (isApiAuthRoute || isPublicRoute) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Check organization access for protected routes
  if (isLoggedIn && user && !isApiRoute) {
    const pathname = nextUrl.pathname;
    
    // Role-based access control
    const role = user.role;
    
    // Technician-only routes restrictions
    if (role === "TECHNICIAN") {
      const allowedRoutes = ["/jobs", "/schedule", "/profile"];
      const isAllowed = allowedRoutes.some(route => pathname.startsWith(route));
      
      if (!isAllowed && pathname !== "/dashboard") {
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
      }
    }

    // Accountant-only routes
    if (role === "ACCOUNTANT") {
      const allowedRoutes = ["/invoices", "/estimates", "/reports", "/payments"];
      const isAllowed = allowedRoutes.some(route => pathname.startsWith(route));
      
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

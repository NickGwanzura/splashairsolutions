import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import {
  createDemoSessionValue,
  DEMO_COOKIE_MAX_AGE,
  DEMO_COOKIE_NAME,
  getDemoRoleFromCookie,
  getValidDemoRole,
  isPublicDemoEnabled,
} from "@/lib/demo";

export async function GET() {
  const cookieStore = await cookies();
  const role = isPublicDemoEnabled()
    ? getDemoRoleFromCookie(cookieStore.get(DEMO_COOKIE_NAME)?.value)
    : null;

  return NextResponse.json({
    active: Boolean(role),
    enabled: isPublicDemoEnabled(),
    role,
  });
}

export async function POST(request: Request) {
  if (!isPublicDemoEnabled()) {
    return NextResponse.json({ error: "Demo access is disabled" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const role = getValidDemoRole(body?.role as UserRole | undefined);
  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: DEMO_COOKIE_NAME,
    value: createDemoSessionValue(role),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DEMO_COOKIE_MAX_AGE,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: DEMO_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}

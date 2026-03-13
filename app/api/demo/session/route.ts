import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createDemoSessionValue,
  DEMO_COOKIE_MAX_AGE,
  DEMO_COOKIE_NAME,
  isDemoCookieValue,
  isPublicDemoEnabled,
} from "@/lib/demo";

export async function GET() {
  const cookieStore = await cookies();
  const active =
    isPublicDemoEnabled() &&
    isDemoCookieValue(cookieStore.get(DEMO_COOKIE_NAME)?.value);

  return NextResponse.json({
    active,
    enabled: isPublicDemoEnabled(),
  });
}

export async function POST() {
  if (!isPublicDemoEnabled()) {
    return NextResponse.json({ error: "Demo access is disabled" }, { status: 403 });
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: DEMO_COOKIE_NAME,
    value: createDemoSessionValue(),
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

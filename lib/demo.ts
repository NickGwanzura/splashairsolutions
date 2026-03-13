import { createHmac, timingSafeEqual } from "crypto";
import { UserRole } from "@prisma/client";
import type { User } from "@/types";

export const DEMO_COOKIE_NAME = "hvacops-demo";
export const DEMO_COOKIE_MAX_AGE = 60 * 60 * 8;
const DEMO_COOKIE_SCOPE = "public-demo";

export const demoUser: User = {
  id: "demo-user",
  email: "demo@hvacops.app",
  name: "Demo Operator",
  avatar: null,
  phone: "(555) 010-2026",
  role: UserRole.OWNER,
  status: "ACTIVE",
  organizationId: "demo-org",
  lastLoginAt: new Date("2026-03-13T09:00:00.000Z"),
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-03-13T09:00:00.000Z"),
};

function getDemoSecret() {
  return process.env.DEMO_SESSION_SECRET || process.env.NEXTAUTH_SECRET || "local-demo-secret";
}

export function isPublicDemoEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_PUBLIC_DEMO === "true";
}

export function createDemoSessionValue() {
  return createHmac("sha256", getDemoSecret()).update(DEMO_COOKIE_SCOPE).digest("hex");
}

export function isDemoCookieValue(value?: string | null) {
  if (!value) {
    return false;
  }

  const expected = createDemoSessionValue();

  try {
    return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
  } catch {
    return false;
  }
}

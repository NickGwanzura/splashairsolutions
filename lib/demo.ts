import { createHmac, timingSafeEqual } from "crypto";
import { UserRole } from "@prisma/client";
import type { User } from "@/types";

export const DEMO_COOKIE_NAME = "hvacops-demo";
export const DEMO_COOKIE_MAX_AGE = 60 * 60 * 8;
const DEMO_COOKIE_SCOPE = "public-demo";
const DEMO_DEFAULT_ROLE = UserRole.OWNER;
const DEMO_ALLOWED_ROLES = new Set<UserRole>([
  UserRole.OWNER,
  UserRole.ADMIN,
  UserRole.DISPATCHER,
  UserRole.TECHNICIAN,
  UserRole.ACCOUNTANT,
]);

const demoProfiles: Record<UserRole, Pick<User, "email" | "name" | "phone">> = {
  [UserRole.OWNER]: {
    email: "owner.demo@hvacops.app",
    name: "Demo Owner",
    phone: "(555) 010-1000",
  },
  [UserRole.ADMIN]: {
    email: "admin.demo@hvacops.app",
    name: "Demo Admin",
    phone: "(555) 010-2000",
  },
  [UserRole.DISPATCHER]: {
    email: "dispatch.demo@hvacops.app",
    name: "Demo Dispatcher",
    phone: "(555) 010-3000",
  },
  [UserRole.TECHNICIAN]: {
    email: "tech.demo@hvacops.app",
    name: "Demo Technician",
    phone: "(555) 010-4000",
  },
  [UserRole.ACCOUNTANT]: {
    email: "accounting.demo@hvacops.app",
    name: "Demo Accountant",
    phone: "(555) 010-5000",
  },
};

function getDemoSecret() {
  return process.env.DEMO_SESSION_SECRET || process.env.NEXTAUTH_SECRET || "local-demo-secret";
}

export function isPublicDemoEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_PUBLIC_DEMO === "true";
}

function createDemoSignature(role: UserRole) {
  return createHmac("sha256", getDemoSecret())
    .update(`${DEMO_COOKIE_SCOPE}:${role}`)
    .digest("hex");
}

export function getValidDemoRole(role?: string | null) {
  if (!role) {
    return DEMO_DEFAULT_ROLE;
  }

  return DEMO_ALLOWED_ROLES.has(role as UserRole) ? (role as UserRole) : DEMO_DEFAULT_ROLE;
}

export function createDemoSessionValue(role: UserRole = DEMO_DEFAULT_ROLE) {
  const validRole = getValidDemoRole(role);

  return `${validRole}.${createDemoSignature(validRole)}`;
}

export function getDemoRoleFromCookie(value?: string | null) {
  if (!value) {
    return null;
  }

  const [role, signature] = value.split(".");

  if (!role || !signature) {
    return null;
  }

  const validRole = getValidDemoRole(role);
  const expected = createDemoSignature(validRole);

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) ? validRole : null;
  } catch {
    return null;
  }
}

export function isDemoCookieValue(value?: string | null) {
  return Boolean(getDemoRoleFromCookie(value));
}

export function getDemoUser(role: UserRole = DEMO_DEFAULT_ROLE): User {
  const validRole = getValidDemoRole(role);
  const profile = demoProfiles[validRole];

  return {
    id: `demo-${validRole.toLowerCase()}`,
    email: profile.email,
    name: profile.name,
    avatar: null,
    phone: profile.phone,
    role: validRole,
    status: "ACTIVE",
    organizationId: "demo-org",
    lastLoginAt: new Date("2026-03-13T09:00:00.000Z"),
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-03-13T09:00:00.000Z"),
  };
}

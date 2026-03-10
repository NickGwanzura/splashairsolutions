import NextAuth from "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      avatar?: string | null;
      role: UserRole;
      organizationId: string;
      organization?: any;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    avatar?: string | null;
    role: UserRole;
    organizationId: string;
    organization?: any;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    organizationId?: string;
    organization?: any;
  }
}

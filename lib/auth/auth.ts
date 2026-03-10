import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const validated = credentialsSchema.safeParse(credentials);
        
        if (!validated.success) {
          return null;
        }

        const { email, password } = validated.data;

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            organization: true,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          organizationId: user.organizationId,
          organization: user.organization,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.organization = user.organization;
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token.name = session.name;
        token.avatar = session.avatar;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.organizationId = token.organizationId as string;
        session.user.organization = token.organization as any;
      }
      return session;
    },
  },
  events: {
    signIn: async ({ user }) => {
      // Audit log for sign in - skipped if no organizationId
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { organizationId: true },
        });
        if (dbUser?.organizationId) {
          await prisma.auditLog.create({
            data: {
              userId: user.id,
              organizationId: dbUser.organizationId,
              action: "LOGIN",
              entityType: "user",
              entityId: user.id,
            },
          });
        }
      } catch {
        // Silently fail audit log
      }
    },
    signOut: async ({ session, token }: any) => {
      // Audit log for sign out
      try {
        if (token?.id) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { organizationId: true },
          });
          if (dbUser?.organizationId) {
            await prisma.auditLog.create({
              data: {
                userId: token.id as string,
                organizationId: dbUser.organizationId,
                action: "LOGOUT",
                entityType: "user",
                entityId: token.id as string,
              },
            });
          }
        }
      } catch {
        // Silently fail audit log
      }
    },
  },
});

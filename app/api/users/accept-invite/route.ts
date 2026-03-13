import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const acceptInviteSchema = z.object({
  token: z.string().min(1),
  name: z.string().trim().min(2).max(100),
  password: z.string().min(6).max(128),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = acceptInviteSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Please provide a valid name and a password with at least 6 characters" },
        { status: 400 }
      );
    }

    const { token, name, password } = validated.data;

    const invitation = await prisma.userInvitation.findUnique({ where: { token } });

    if (!invitation || invitation.status !== "PENDING" || invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({ error: "An account for this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: invitation.email,
        name,
        password: hashedPassword,
        role: invitation.role,
        status: "ACTIVE",
        organizationId: invitation.organizationId,
      },
    });

    await prisma.userInvitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: invitation.organizationId,
        userId: user.id,
        action: "CREATE",
        entityType: "user",
        entityId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}

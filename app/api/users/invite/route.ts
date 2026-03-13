import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { randomBytes } from "crypto";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { sendInvitationEmail } from "@/lib/services/email";

const inviteSchema = z.object({
  email: z.string().trim().email(),
  role: z.nativeEnum(UserRole),
});

// POST /api/users/invite - Send invitation
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["OWNER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validated = inviteSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "A valid email and role are required" },
        { status: 400 }
      );
    }

    const email = validated.data.email.toLowerCase();
    const role = validated.data.role;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const existingInvite = await prisma.userInvitation.findFirst({
      where: {
        email,
        organizationId: session.user.organizationId,
        status: "PENDING",
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: "Pending invitation already exists" },
        { status: 400 }
      );
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const organization = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { name: true },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const invitation = await prisma.userInvitation.create({
      data: {
        email,
        organizationId: session.user.organizationId,
        role,
        token,
        invitedById: session.user.id,
        status: "PENDING",
        expiresAt,
      },
    });

    try {
      await sendInvitationEmail({
        to: email,
        organizationName: organization.name,
        inviteToken: token,
        invitedBy: session.user.name || session.user.email,
      });
    } catch (error) {
      await prisma.userInvitation.delete({
        where: { id: invitation.id },
      });

      console.error("Error sending invitation email:", error);

      return NextResponse.json(
        { error: "Invitation could not be delivered. Check email configuration and try again." },
        { status: 503 }
      );
    }

    await prisma.auditLog.create({
      data: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
        action: "SEND",
        entityType: "user_invitation",
        entityId: invitation.id,
        newValues: { email, role },
      },
    });

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error sending invitation:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}

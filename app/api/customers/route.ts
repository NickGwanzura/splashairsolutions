import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const createCustomerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phones: z.array(
    z.object({
      number: z.string(),
      type: z.enum(["MOBILE", "HOME", "WORK", "OTHER"]),
      isPrimary: z.boolean(),
    })
  ),
  type: z.enum(["RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL", "GOVERNMENT"]).default("RESIDENTIAL"),
  internalNotes: z.string().optional(),
  properties: z.array(
    z.object({
      name: z.string().optional(),
      address: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      zipCode: z.string().min(1),
      isPrimary: z.boolean().default(true),
    })
  ).optional(),
});

// GET /api/customers - List customers
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const where: any = {
      organizationId: session.user.organizationId,
      ...(status && { status }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          properties: true,
          _count: {
            select: {
              jobs: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.customer.count({ where }),
    ]);

    return NextResponse.json({
      data: customers,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

// POST /api/customers - Create a new customer
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createCustomerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        organizationId: session.user.organizationId,
        createdById: session.user.id,
        firstName: validated.data.firstName,
        lastName: validated.data.lastName,
        email: validated.data.email,
        phones: validated.data.phones,
        type: validated.data.type,
        internalNotes: validated.data.internalNotes,
        properties: validated.data.properties
          ? {
              create: validated.data.properties,
            }
          : undefined,
      },
      include: {
        properties: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
        action: "CREATE",
        entityType: "customer",
        entityId: customer.id,
        newValues: customer as any,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}

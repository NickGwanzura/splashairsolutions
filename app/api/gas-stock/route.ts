import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const addGasStockSchema = z.object({
  gasType: z.string().trim().min(1, "Gas type is required"),
  brand: z.string().trim().min(1, "Brand is required"),
  quantity: z.coerce.number().positive("Quantity must be greater than zero"),
  remaining: z.coerce.number().positive("Remaining quantity must be greater than zero").optional(),
  unit: z.string().trim().min(1, "Unit is required").default("kg"),
  supplier: z.string().trim().min(1, "Supplier is required"),
  supplierRef: z.string().trim().optional(),
  date: z.coerce.date().optional(),
  notes: z.string().trim().optional(),
});

const adminRoles = new Set(["OWNER", "ADMIN"]);

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stock = await prisma.gasStock.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      orderBy: [
        { gasType: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ data: stock });
  } catch (error) {
    console.error("Error fetching gas stock:", error);
    return NextResponse.json({ error: "Failed to fetch gas stock" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!adminRoles.has(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validated = addGasStockSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const {
      gasType,
      brand,
      quantity,
      remaining,
      unit,
      supplier,
      supplierRef,
      date,
      notes,
    } = validated.data;

    const stock = await prisma.gasStock.create({
      data: {
        organizationId: session.user.organizationId,
        gasType,
        brand,
        quantity: quantity.toFixed(2),
        remaining: (remaining ?? quantity).toFixed(2),
        unit,
        supplier,
        supplierRef: supplierRef || null,
        addedBy: session.user.id,
        date: date ?? new Date(),
        notes: notes || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
        action: "CREATE",
        entityType: "gas_stock",
        entityId: stock.id,
        newValues: stock as any,
      },
    });

    return NextResponse.json(stock, { status: 201 });
  } catch (error) {
    console.error("Error adding gas stock:", error);
    return NextResponse.json({ error: "Failed to add gas stock" }, { status: 500 });
  }
}

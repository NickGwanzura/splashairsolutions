import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const recordGasUsageSchema = z.object({
  stockId: z.string().min(1),
  quantityUsed: z.coerce.number().positive(),
  purpose: z.string().min(1),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const usage = await prisma.gasUsage.findMany({
      where: {
        jobId: id,
        organizationId: session.user.organizationId,
      },
      include: {
        stock: true,
      },
      orderBy: { usedAt: "desc" },
    });

    return NextResponse.json({ data: usage });
  } catch (error) {
    console.error("Error fetching gas usage:", error);
    return NextResponse.json({ error: "Failed to fetch gas usage" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = recordGasUsageSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { id } = await params;
    const { stockId, quantityUsed, purpose } = validated.data;

    const result = await prisma.$transaction(async (tx) => {
      const job = await tx.job.findFirst({
        where: {
          id,
          organizationId: session.user.organizationId,
        },
        include: {
          customer: true,
        },
      });

      if (!job) {
        throw new Error("JOB_NOT_FOUND");
      }

      const stock = await tx.gasStock.findFirst({
        where: {
          id: stockId,
          organizationId: session.user.organizationId,
        },
      });

      if (!stock) {
        throw new Error("STOCK_NOT_FOUND");
      }

      const remaining = Number(stock.remaining);

      if (remaining < quantityUsed) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      const nextRemaining = Math.round((remaining - quantityUsed) * 100) / 100;

      const usage = await tx.gasUsage.create({
        data: {
          organizationId: session.user.organizationId,
          stockId,
          jobId: id,
          gasType: stock.gasType,
          quantityUsed: String(quantityUsed),
          usedById: session.user.id,
          customerName: `${job.customer.firstName} ${job.customer.lastName}`,
          purpose,
        },
        include: {
          stock: true,
        },
      });

      await tx.gasStock.update({
        where: { id: stockId },
        data: {
          remaining: nextRemaining.toFixed(2),
        },
      });

      await tx.auditLog.create({
        data: {
          organizationId: session.user.organizationId,
          userId: session.user.id,
          action: "CREATE",
          entityType: "gas_usage",
          entityId: usage.id,
          newValues: usage as any,
        },
      });

      return usage;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "JOB_NOT_FOUND") {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }

      if (error.message === "STOCK_NOT_FOUND") {
        return NextResponse.json({ error: "Gas stock not found" }, { status: 404 });
      }

      if (error.message === "INSUFFICIENT_STOCK") {
        return NextResponse.json({ error: "Insufficient gas stock remaining" }, { status: 400 });
      }
    }

    console.error("Error recording gas usage:", error);
    return NextResponse.json({ error: "Failed to record gas usage" }, { status: 500 });
  }
}

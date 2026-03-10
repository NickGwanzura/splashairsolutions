import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import { JobStatus } from "@prisma/client";

const createJobSchema = z.object({
  customerId: z.string(),
  propertyId: z.string(),
  type: z.enum(["INSTALLATION", "REPAIR", "MAINTENANCE", "INSPECTION", "EMERGENCY", "QUOTE"]),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  title: z.string().min(1),
  description: z.string().optional(),
  instructions: z.string().optional(),
  scheduledDate: z.string().datetime().optional(),
  scheduledTimeStart: z.string().datetime().optional(),
  scheduledTimeEnd: z.string().datetime().optional(),
  estimatedDuration: z.number().optional(),
  estimatedCost: z.number().optional(),
});

// GET /api/jobs - List jobs
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const where: any = {
      organizationId: session.user.organizationId,
      ...(status && { status: status as JobStatus }),
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          property: {
            select: {
              id: true,
              address: true,
              city: true,
            },
          },
          assignments: {
            include: {
              technician: {
                include: {
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      data: jobs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Create a new job
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createJobSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    // Generate job number
    const year = new Date().getFullYear();
    const count = await prisma.job.count({
      where: {
        organizationId: session.user.organizationId,
        createdAt: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      },
    });
    const jobNumber = `JOB-${year}-${String(count + 1).padStart(4, "0")}`;

    const job = await prisma.job.create({
      data: {
        jobNumber,
        organizationId: session.user.organizationId,
        createdById: session.user.id,
        customerId: validated.data.customerId,
        propertyId: validated.data.propertyId,
        type: validated.data.type,
        priority: validated.data.priority,
        title: validated.data.title,
        description: validated.data.description,
        instructions: validated.data.instructions,
        scheduledDate: validated.data.scheduledDate
          ? new Date(validated.data.scheduledDate)
          : null,
        scheduledTimeStart: validated.data.scheduledTimeStart
          ? new Date(validated.data.scheduledTimeStart)
          : null,
        scheduledTimeEnd: validated.data.scheduledTimeEnd
          ? new Date(validated.data.scheduledTimeEnd)
          : null,
        estimatedDuration: validated.data.estimatedDuration,
        estimatedCost: validated.data.estimatedCost
          ? String(validated.data.estimatedCost)
          : null,
      },
      include: {
        customer: true,
        property: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
        action: "CREATE",
        entityType: "job",
        entityId: job.id,
        newValues: job as any,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Helper functions for common queries with multi-tenant filtering

export async function getOrganizationById(id: string) {
  return prisma.organization.findUnique({
    where: { id },
  });
}

export async function getOrganizationBySlug(slug: string) {
  return prisma.organization.findUnique({
    where: { slug },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      organization: true,
    },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      organization: true,
    },
  });
}

// Customer queries
export async function getCustomersByOrganization(organizationId: string, options?: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const { search, status, page = 1, pageSize = 20 } = options || {};
  
  const where: any = {
    organizationId,
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(status && { status }),
  };

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      include: {
        properties: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.count({ where }),
  ]);

  return { customers, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getCustomerById(id: string, organizationId: string) {
  return prisma.customer.findFirst({
    where: { id, organizationId },
    include: {
      properties: true,
      equipment: {
        include: {
          property: true,
        },
      },
      jobs: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          property: true,
          assignments: {
            include: {
              technician: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

// Job queries
export async function getJobsByOrganization(organizationId: string, options?: {
  search?: string;
  status?: JobStatus | JobStatus[];
  priority?: string;
  technicianId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  pageSize?: number;
}) {
  const { 
    search, 
    status, 
    priority, 
    technicianId, 
    dateFrom, 
    dateTo, 
    page = 1, 
    pageSize = 20 
  } = options || {};

  const where: any = {
    organizationId,
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { jobNumber: { contains: search, mode: "insensitive" } },
        { customer: { firstName: { contains: search, mode: "insensitive" } } },
        { customer: { lastName: { contains: search, mode: "insensitive" } } },
      ],
    }),
    ...(status && { 
      status: Array.isArray(status) ? { in: status } : status 
    }),
    ...(priority && { priority }),
    ...(technicianId && {
      assignments: {
        some: { technicianId },
      },
    }),
    ...((dateFrom || dateTo) && {
      scheduledDate: {
        ...(dateFrom && { gte: dateFrom }),
        ...(dateTo && { lte: dateTo }),
      },
    }),
  };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        customer: true,
        property: true,
        assignments: {
          include: {
            technician: {
              include: {
                user: true,
              },
            },
          },
        },
        invoice: {
          select: {
            id: true,
            status: true,
            total: true,
          },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.job.count({ where }),
  ]);

  return { jobs, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getJobById(id: string, organizationId: string) {
  return prisma.job.findFirst({
    where: { id, organizationId },
    include: {
      customer: true,
      property: true,
      assignments: {
        include: {
          technician: {
            include: {
              user: true,
            },
          },
        },
      },
      statusHistory: {
        orderBy: { createdAt: "desc" },
      },
      checklistItems: {
        orderBy: { sortOrder: "asc" },
      },
      photos: {
        orderBy: { takenAt: "desc" },
      },
      notes: {
        orderBy: { createdAt: "desc" },
      },
      invoice: true,
    },
  });
}

// Technician queries
export async function getTechniciansByOrganization(organizationId: string) {
  return prisma.technician.findMany({
    where: { organizationId },
    include: {
      user: true,
    },
    orderBy: {
      user: {
        name: "asc",
      },
    },
  });
}

export async function getTechnicianById(id: string, organizationId: string) {
  return prisma.technician.findFirst({
    where: { id, organizationId },
    include: {
      user: true,
    },
  });
}

// Invoice queries
export async function getInvoicesByOrganization(organizationId: string, options?: {
  search?: string;
  status?: string;
  customerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  pageSize?: number;
}) {
  const { search, status, customerId, dateFrom, dateTo, page = 1, pageSize = 20 } = options || {};

  const where: any = {
    organizationId,
    ...(search && {
      OR: [
        { invoiceNumber: { contains: search, mode: "insensitive" as const } },
        { customer: { firstName: { contains: search, mode: "insensitive" as const } } },
        { customer: { lastName: { contains: search, mode: "insensitive" as const } } },
      ],
    }),
    ...(status && { status }),
    ...(customerId && { customerId }),
    ...((dateFrom || dateTo) && {
      issueDate: {
        ...(dateFrom && { gte: dateFrom }),
        ...(dateTo && { lte: dateTo }),
      },
    }),
  };

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        customer: true,
        job: true,
        lineItems: {
          orderBy: { sortOrder: "asc" },
        },
        payments: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.invoice.count({ where }),
  ]);

  return { invoices, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

// Schedule queries
export async function getSchedulesByDateRange(
  organizationId: string,
  startDate: Date,
  endDate: Date,
  technicianId?: string
) {
  return prisma.schedule.findMany({
    where: {
      organizationId,
      technicianId,
      startTime: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      technician: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { startTime: "asc" },
  });
}

// Dashboard queries
export async function getDashboardMetrics(organizationId: string, dateFrom: Date, dateTo: Date) {
  const [
    revenueData,
    jobsCompleted,
    activeJobs,
    pendingInvoices,
    totalInvoices,
  ] = await Promise.all([
    // Revenue in date range
    prisma.invoice.aggregate({
      where: {
        organizationId,
        status: { in: ["PAID", "PARTIAL"] },
        paidAt: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      _sum: { amountPaid: true },
    }),
    // Jobs completed in date range
    prisma.job.count({
      where: {
        organizationId,
        status: { in: ["COMPLETED", "INVOICED", "PAID"] },
        completedAt: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
    }),
    // Active jobs (not completed/cancelled)
    prisma.job.count({
      where: {
        organizationId,
        status: { notIn: ["COMPLETED", "INVOICED", "PAID", "CANCELLED"] },
      },
    }),
    // Pending invoices
    prisma.invoice.count({
      where: {
        organizationId,
        status: { in: ["SENT", "VIEWED", "PARTIAL", "OVERDUE"] },
      },
    }),
    // Total invoices for average calculation
    prisma.invoice.count({
      where: {
        organizationId,
        status: { not: "DRAFT" },
        issueDate: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
    }),
  ]);

  // Calculate average job value
  const invoiceTotals = await prisma.invoice.aggregate({
    where: {
      organizationId,
      status: { not: "DRAFT" },
      issueDate: {
        gte: dateFrom,
        lte: dateTo,
      },
    },
    _avg: { total: true },
  });

  // Get previous period for comparison
  const periodLength = dateTo.getTime() - dateFrom.getTime();
  const prevDateFrom = new Date(dateFrom.getTime() - periodLength);
  const prevDateTo = new Date(dateTo.getTime() - periodLength);

  const [prevRevenue, prevJobs] = await Promise.all([
    prisma.invoice.aggregate({
      where: {
        organizationId,
        status: { in: ["PAID", "PARTIAL"] },
        paidAt: {
          gte: prevDateFrom,
          lte: prevDateTo,
        },
      },
      _sum: { amountPaid: true },
    }),
    prisma.job.count({
      where: {
        organizationId,
        status: { in: ["COMPLETED", "INVOICED", "PAID"] },
        completedAt: {
          gte: prevDateFrom,
          lte: prevDateTo,
        },
      },
    }),
  ]);

  const currentRevenue = Number(revenueData._sum.amountPaid || 0);
  const previousRevenue = Number(prevRevenue._sum.amountPaid || 0);
  const revenueChange = previousRevenue > 0 
    ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
    : 0;

  const jobsChange = prevJobs > 0 
    ? ((jobsCompleted - prevJobs) / prevJobs) * 100 
    : 0;

  return {
    totalRevenue: currentRevenue,
    revenueChange: Math.round(revenueChange * 100) / 100,
    jobsCompleted,
    jobsChange: Math.round(jobsChange * 100) / 100,
    activeJobs,
    invoicesPending: pendingInvoices,
    averageJobValue: Number(invoiceTotals._avg.total || 0),
    technicianUtilization: 0, // Calculate based on schedule data
  };
}

// Import JobStatus from prisma client for the queries above
import { JobStatus } from "@prisma/client";

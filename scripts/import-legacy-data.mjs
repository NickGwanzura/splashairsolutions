import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ORGANIZATION_ID = "splashair-legacy-org";
const ORGANIZATION_NAME = "Splashair";

function splitName(name) {
  const parts = String(name || "Unknown Customer").trim().split(/\s+/).filter(Boolean);

  if (parts.length <= 1) {
    return { firstName: parts[0] || "Unknown", lastName: "Customer" };
  }

  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts.at(-1),
  };
}

function mapRole(role, index) {
  if (index === 0 && role === "admin") return "OWNER";
  if (role === "admin") return "ADMIN";
  if (role === "tech") return "TECHNICIAN";
  return "ACCOUNTANT";
}

function mapUserStatus(status) {
  return status === "inactive" ? "INACTIVE" : "ACTIVE";
}

function mapJobType(type) {
  const normalized = String(type || "").toLowerCase();
  const map = {
    installation: "INSTALLATION",
    maintenance: "MAINTENANCE",
    repair: "REPAIR",
    inspection: "INSPECTION",
    sales: "QUOTE",
    callout: "EMERGENCY",
  };

  return map[normalized] ?? "REPAIR";
}

function mapPriority(priority) {
  const normalized = String(priority || "").toLowerCase();
  const map = {
    urgent: "URGENT",
    high: "HIGH",
    medium: "NORMAL",
    low: "LOW",
  };

  return map[normalized] ?? "NORMAL";
}

function mapJobStatus(status) {
  const normalized = String(status || "").toLowerCase();
  const map = {
    scheduled: "SCHEDULED",
    "in-progress": "IN_PROGRESS",
    "on-site": "IN_PROGRESS",
    completed: "COMPLETED",
    cancelled: "CANCELLED",
    "pending-parts": "ON_HOLD",
    unallocated: "NEW",
    "pending-booking": "NEW",
  };

  return map[normalized] ?? "NEW";
}

function parseScheduledDate(date, time) {
  if (!date) return null;

  const value = `${date}T${time || "00:00"}:00`;
  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function ensureSeededAccessUsers() {
  const password = await bcrypt.hash("password123", 10);
  const users = [
    { email: "owner@coolairhvac.com", name: "Seeded Owner", role: "OWNER" },
    { email: "admin@coolairhvac.com", name: "Seeded Admin", role: "ADMIN" },
    { email: "dispatch@coolairhvac.com", name: "Seeded Dispatcher", role: "DISPATCHER" },
    { email: "mike.j@coolairhvac.com", name: "Seeded Technician", role: "TECHNICIAN" },
    { email: "accounting@coolairhvac.com", name: "Seeded Accountant", role: "ACCOUNTANT" },
  ];

  for (const [index, user] of users.entries()) {
    const savedUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        status: "ACTIVE",
      },
      create: {
        email: user.email,
        password,
        name: user.name,
        role: user.role,
        status: "ACTIVE",
        organizationId: ORGANIZATION_ID,
      },
    });

    if (user.role === "TECHNICIAN") {
      await prisma.technician.upsert({
        where: { userId: savedUser.id },
        update: {},
        create: {
          userId: savedUser.id,
          organizationId: ORGANIZATION_ID,
          employeeId: `SEED-${String(index + 1).padStart(3, "0")}`,
          skills: ["HVAC"],
          certifications: [],
          status: "AVAILABLE",
        },
      });
    }
  }
}

async function legacyTableExists(tableName) {
  const rows = await prisma.$queryRawUnsafe(
    "select to_regclass($1)::text as name",
    `legacy.${tableName}`
  );

  return Boolean(rows[0]?.name);
}

async function main() {
  if (!(await legacyTableExists("legacy_users"))) {
    console.log("No legacy schema data found to import.");
    return;
  }

  await prisma.organization.upsert({
    where: { id: ORGANIZATION_ID },
    update: {},
    create: {
      id: ORGANIZATION_ID,
      name: ORGANIZATION_NAME,
      slug: "splashair",
      country: "ZW",
      timezone: "Africa/Harare",
      currency: "USD",
      subscriptionTier: "PROFESSIONAL",
      subscriptionStatus: "ACTIVE",
      maxUsers: 20,
      maxTechnicians: 20,
      maxJobsPerMonth: 1000,
    },
  });

  await ensureSeededAccessUsers();

  const legacyUsers = await prisma.$queryRawUnsafe(`
    select id, name, email, role::text as role, password, phone, status::text as status, image, created_at, updated_at
    from legacy.legacy_users
    order by created_at, id
  `);

  let fallbackCreatorId = null;

  for (const [index, user] of legacyUsers.entries()) {
    const role = mapRole(user.role, index);

    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        name: user.name,
        phone: user.phone || null,
        avatar: user.image || null,
        role,
        status: mapUserStatus(user.status),
      },
      create: {
        id: user.id,
        email: user.email,
        password: user.password,
        name: user.name,
        phone: user.phone || null,
        avatar: user.image || null,
        role,
        status: mapUserStatus(user.status),
        organizationId: ORGANIZATION_ID,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });

    if (!fallbackCreatorId || role === "OWNER") {
      fallbackCreatorId = user.id;
    }

    if (role === "TECHNICIAN") {
      await prisma.technician.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          organizationId: ORGANIZATION_ID,
          employeeId: `LEG-${String(index + 1).padStart(3, "0")}`,
          skills: ["HVAC"],
          certifications: [],
          status: user.status === "available" ? "AVAILABLE" : "OFFLINE",
        },
      });
    }
  }

  if (!fallbackCreatorId) {
    throw new Error("Cannot import legacy customers without at least one user");
  }

  const legacyCustomers = await prisma.$queryRawUnsafe(`
    select id, name, address, site_address, phone, email, created_at, updated_at
    from legacy.legacy_customers
    order by created_at, id
  `);

  const propertyIdsByCustomer = new Map();

  for (const customer of legacyCustomers) {
    const { firstName, lastName } = splitName(customer.name);
    const propertyId = `property_${customer.id}`;
    propertyIdsByCustomer.set(customer.id, propertyId);

    await prisma.customer.upsert({
      where: { id: customer.id },
      update: {
        firstName,
        lastName,
        email: customer.email || null,
        phones: customer.phone ? [{ number: customer.phone, type: "MOBILE", isPrimary: true }] : [],
      },
      create: {
        id: customer.id,
        organizationId: ORGANIZATION_ID,
        createdById: fallbackCreatorId,
        firstName,
        lastName,
        email: customer.email || null,
        phones: customer.phone ? [{ number: customer.phone, type: "MOBILE", isPrimary: true }] : [],
        type: "COMMERCIAL",
        status: "ACTIVE",
        source: "Legacy import",
        internalNotes: customer.site_address ? `Legacy site address: ${customer.site_address}` : null,
        createdAt: customer.created_at,
        updatedAt: customer.updated_at,
      },
    });

    await prisma.property.upsert({
      where: { id: propertyId },
      update: {
        address: customer.site_address || customer.address,
      },
      create: {
        id: propertyId,
        customerId: customer.id,
        name: "Primary Location",
        address: customer.site_address || customer.address,
        city: "Harare",
        state: "Harare",
        zipCode: "00000",
        country: "ZW",
        propertyType: "COMMERCIAL",
        isPrimary: true,
        createdAt: customer.created_at,
      },
    });
  }

  const legacyJobs = await prisma.$queryRawUnsafe(`
    select id, customer_id, title, type::text as type, priority::text as priority, status::text as status,
      date, time, description, job_card_ref, created_at, updated_at
    from legacy.legacy_jobs
    order by created_at, id
  `);

  for (const [index, job] of legacyJobs.entries()) {
    const propertyId = propertyIdsByCustomer.get(job.customer_id);

    if (!propertyId) {
      continue;
    }

    const scheduledDate = parseScheduledDate(job.date, job.time);

    await prisma.job.upsert({
      where: { id: job.id },
      update: {
        title: job.title,
        description: job.description || null,
        status: mapJobStatus(job.status),
      },
      create: {
        id: job.id,
        jobNumber: job.job_card_ref || `LEGACY-${String(index + 1).padStart(4, "0")}`,
        organizationId: ORGANIZATION_ID,
        customerId: job.customer_id,
        propertyId,
        createdById: fallbackCreatorId,
        type: mapJobType(job.type),
        priority: mapPriority(job.priority),
        status: mapJobStatus(job.status),
        title: job.title,
        description: job.description || null,
        scheduledDate,
        scheduledTimeStart: scheduledDate,
        createdAt: job.created_at,
        updatedAt: job.updated_at,
      },
    });
  }

  console.log(
    `Imported ${legacyUsers.length} users, ${legacyCustomers.length} customers, and ${legacyJobs.length} jobs.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const tableNames = [
  "accounts",
  "sessions",
  "verification_tokens",
  "users",
  "customers",
  "jobs",
  "comments",
  "crm_records",
  "diagnostics",
  "gas_stock",
  "gas_usage",
  "history_entries",
  "recurring_schedules",
  "_AssignedJobs",
  "_CoAssignedJobs",
];

const typeNames = [
  "AlertType",
  "CRMOutcome",
  "CRMType",
  "IssueType",
  "JobPriority",
  "JobSource",
  "JobStatus",
  "JobType",
  "RefrigerantType",
  "SystemStatus",
  "TechStatus",
  "UnitType",
  "UserRole",
];

function quoteIdentifier(identifier) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

async function tableExists(tableName) {
  const rows = await prisma.$queryRawUnsafe(
    "select to_regclass($1)::text as name",
    `public.${tableName}`
  );

  return Boolean(rows[0]?.name);
}

async function typeExists(typeName) {
  const rows = await prisma.$queryRawUnsafe(
    "select exists(select 1 from pg_type where typname = $1) as exists",
    typeName
  );

  return Boolean(rows[0]?.exists);
}

async function main() {
  await prisma.$executeRawUnsafe("begin");

  try {
    for (const table of tableNames) {
      const legacyTable = `legacy_${table}`;

      if ((await tableExists(table)) && !(await tableExists(legacyTable))) {
        await prisma.$executeRawUnsafe(
          `alter table public.${quoteIdentifier(table)} rename to ${quoteIdentifier(legacyTable)}`
        );
      }
    }

    for (const type of typeNames) {
      const legacyType = `legacy_${type}`;

      if ((await typeExists(type)) && !(await typeExists(legacyType))) {
        await prisma.$executeRawUnsafe(
          `alter type public.${quoteIdentifier(type)} rename to ${quoteIdentifier(legacyType)}`
        );
      }
    }

    await prisma.$executeRawUnsafe("commit");
  } catch (error) {
    await prisma.$executeRawUnsafe("rollback").catch(() => {});
    throw error;
  }

  console.log("Legacy schema preserved with legacy_ prefixes.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

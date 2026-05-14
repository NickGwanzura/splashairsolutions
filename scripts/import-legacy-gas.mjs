import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ORGANIZATION_ID = "splashair-legacy-org";

function parseDate(value, fallback = new Date()) {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function parseUsedAt(date, time, fallback) {
  if (!date) return fallback;
  const parsed = new Date(`${date}T${time || "00:00"}:00`);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

async function legacyTableExists(tableName) {
  const rows = await prisma.$queryRawUnsafe(
    "select to_regclass($1)::text as name",
    `legacy.${tableName}`
  );

  return Boolean(rows[0]?.name);
}

async function main() {
  if (!(await legacyTableExists("legacy_gas_stock"))) {
    console.log("No legacy gas data found.");
    return;
  }

  const stockRows = await prisma.$queryRawUnsafe(`
    select id, gas_type, brand, quantity, remaining, unit, supplier, supplier_ref, added_by, date, notes, created_at, updated_at
    from legacy.legacy_gas_stock
    order by created_at, id
  `);

  for (const stock of stockRows) {
    await prisma.gasStock.upsert({
      where: { id: stock.id },
      update: {
        gasType: stock.gas_type,
        brand: stock.brand,
        quantity: String(stock.quantity),
        remaining: String(stock.remaining),
        unit: stock.unit,
        supplier: stock.supplier,
        supplierRef: stock.supplier_ref || null,
        addedBy: stock.added_by || null,
        date: parseDate(stock.date, stock.created_at),
        notes: stock.notes || null,
      },
      create: {
        id: stock.id,
        organizationId: ORGANIZATION_ID,
        gasType: stock.gas_type,
        brand: stock.brand,
        quantity: String(stock.quantity),
        remaining: String(stock.remaining),
        unit: stock.unit,
        supplier: stock.supplier,
        supplierRef: stock.supplier_ref || null,
        addedBy: stock.added_by || null,
        date: parseDate(stock.date, stock.created_at),
        notes: stock.notes || null,
        createdAt: stock.created_at,
        updatedAt: stock.updated_at,
      },
    });
  }

  const usageRows = await prisma.$queryRawUnsafe(`
    select id, stock_id, gas_type, quantity_used, used_by, job_id, customer, date, time, purpose, created_at
    from legacy.legacy_gas_usage
    order by created_at, id
  `);

  for (const usage of usageRows) {
    const stock = await prisma.gasStock.findUnique({ where: { id: usage.stock_id } });
    const job = await prisma.job.findUnique({ where: { id: usage.job_id } });

    if (!stock || !job) {
      continue;
    }

    await prisma.gasUsage.upsert({
      where: { id: usage.id },
      update: {
        gasType: usage.gas_type,
        quantityUsed: String(usage.quantity_used),
        usedById: usage.used_by || null,
        customerName: usage.customer,
        purpose: usage.purpose,
        usedAt: parseUsedAt(usage.date, usage.time, usage.created_at),
      },
      create: {
        id: usage.id,
        organizationId: ORGANIZATION_ID,
        stockId: usage.stock_id,
        jobId: usage.job_id,
        gasType: usage.gas_type,
        quantityUsed: String(usage.quantity_used),
        usedById: usage.used_by || null,
        customerName: usage.customer,
        purpose: usage.purpose,
        usedAt: parseUsedAt(usage.date, usage.time, usage.created_at),
        createdAt: usage.created_at,
      },
    });
  }

  console.log(`Imported ${stockRows.length} gas stock rows and ${usageRows.length} gas usage rows.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

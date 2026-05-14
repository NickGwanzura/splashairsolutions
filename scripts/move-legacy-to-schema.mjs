import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function quoteIdentifier(identifier) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

async function main() {
  const tables = await prisma.$queryRaw`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_type = 'BASE TABLE'
    order by table_name
  `;

  const enumTypes = await prisma.$queryRaw`
    select t.typname as type_name
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typtype = 'e'
    order by t.typname
  `;

  await prisma.$executeRawUnsafe("begin");

  try {
    await prisma.$executeRawUnsafe("create schema if not exists legacy");

    for (const table of tables) {
      await prisma.$executeRawUnsafe(
        `alter table public.${quoteIdentifier(table.table_name)} set schema legacy`
      );
    }

    for (const type of enumTypes) {
      await prisma.$executeRawUnsafe(
        `alter type public.${quoteIdentifier(type.type_name)} set schema legacy`
      );
    }

    await prisma.$executeRawUnsafe("commit");
  } catch (error) {
    await prisma.$executeRawUnsafe("rollback").catch(() => {});
    throw error;
  }

  console.log(`Moved ${tables.length} tables and ${enumTypes.length} enum types into legacy schema.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

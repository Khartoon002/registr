// scripts/copy-sqlite-to-supabase.mjs
// Copies data from your local SQLite DB into your Supabase Postgres DB.
// Usage (CMD):
//   set SQLITE_URL=file:./dev.db && npm run copy:sqlite
// Usage (PowerShell):
//   $env:SQLITE_URL="file:./dev.db"; npm run copy:sqlite
//
// Requirements:
// - .env must have DATABASE_URL pointing to your Supabase Postgres
// - npm script:  "copy:sqlite": "node scripts/copy-sqlite-to-supabase.mjs"

import { PrismaClient } from "@prisma/client";

// Read from env:
//  - SQLITE_URL: path/URL to your SQLite file (e.g. file:./dev.db)
//  - DATABASE_URL: your Supabase Postgres URL (already in .env)
const SQLITE_URL   = process.env.SQLITE_URL || "file:./dev.db";
const POSTGRES_URL = process.env.DATABASE_URL;

if (!POSTGRES_URL) {
  console.error("❌ Missing DATABASE_URL (Supabase). Set it in .env");
  process.exit(1);
}

console.log("SQLite:", SQLITE_URL);
console.log("Postgres:", POSTGRES_URL.replace(/(\/\/[^:]+:)[^@]+/, "$1********"));

// Two Prisma clients: one for SQLite, one for Supabase Postgres
const sqlite = new PrismaClient({ datasources: { db: { url: SQLITE_URL } } });
const pg     = new PrismaClient({ datasources: { db: { url: POSTGRES_URL } } });

// Simple helper to copy a table with logging and soft upsert
async function copyTable({ name, read, write }) {
  console.log(`\n→ Copying ${name}...`);
  const rows = await read();
  console.log(`   ${name}: ${rows.length} rows`);
  let ok = 0, skip = 0;

  for (const r of rows) {
    try {
      await write(r);
      ok++;
    } catch (e) {
      skip++;
      const msg = e?.message || String(e);
      console.warn(`   ⚠️  Skip ${name} ${r.id ?? ""}: ${msg}`);
    }
  }
  console.log(`✓ Done ${name} (copied: ${ok}, skipped: ${skip})`);
}

async function main() {
  // Order matters — respect foreign keys:
  // Project -> Package -> PersonLink -> Downline
  // Bot -> BotPage
  // User
  // Audit

  await copyTable({
    name: "Project",
    read: () => sqlite.project.findMany(),
    write: (r) =>
      pg.project.upsert({
        where: { id: r.id },
        create: {
          id: r.id,
          name: r.name,
          slug: r.slug,
          description: r.description,
          status: r.status,
          defaultWhatsApp: r.defaultWhatsApp,
          taskerTag: r.taskerTag,
          createdById: r.createdById,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          archivedAt: r.archivedAt,
          deleted: r.deleted,
        },
        update: {},
      }),
  });

  await copyTable({
    name: "Package",
    read: () => sqlite.package.findMany(),
    write: (r) =>
      pg.package.upsert({
        where: { id: r.id },
        create: {
          id: r.id,
          projectId: r.projectId,
          name: r.name,
          slug: r.slug,
          description: r.description,
          status: r.status,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          archivedAt: r.archivedAt,
          deleted: r.deleted,
        },
        update: {},
      }),
  });

  await copyTable({
    name: "PersonLink",
    read: () => sqlite.personLink.findMany(),
    write: (r) =>
      pg.personLink.upsert({
        where: { id: r.id },
        create: {
          id: r.id,
          token: r.token,
          projectId: r.projectId,
          packageId: r.packageId,
          forName: r.forName,
          forPhone: r.forPhone,
          oneTime: r.oneTime,
          consumedAt: r.consumedAt,
          usedByDownlineId: r.usedByDownlineId,
          createdAt: r.createdAt,
        },
        update: {},
      }),
  });

  await copyTable({
    name: "Downline",
    read: () => sqlite.downline.findMany(),
    write: (r) =>
      pg.downline.upsert({
        where: { id: r.id },
        create: {
          id: r.id,
          projectId: r.projectId,
          packageId: r.packageId,
          fullName: r.fullName,
          username: r.username,
          passwordHash: r.passwordHash,
          passwordPlain: r.passwordPlain, // you asked to retain this
          phone: r.phone,
          email: r.email,
          uniqueCode: r.uniqueCode,
          createdAt: r.createdAt,
        },
        update: {},
      }),
  });

  await copyTable({
    name: "Bot",
    read: () => sqlite.bot.findMany(),
    write: (r) =>
      pg.bot.upsert({
        where: { id: r.id },
        create: {
          id: r.id,
          name: r.name,
          slug: r.slug,
          isActive: r.isActive,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        },
        update: {},
      }),
  });

  await copyTable({
    name: "BotPage",
    read: () => sqlite.botPage.findMany(),
    write: (r) =>
      pg.botPage.upsert({
        where: { id: r.id },
        create: {
          id: r.id,
          botId: r.botId,
          version: r.version,
          html: r.html,
          createdAt: r.createdAt,
        },
        update: {},
      }),
  });

  await copyTable({
    name: "User",
    read: () => sqlite.user.findMany(),
    write: (r) =>
      pg.user.upsert({
        where: { id: r.id },
        create: {
          id: r.id,
          email: r.email,
          passwordHash: r.passwordHash,
          role: r.role,
          theme: r.theme,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        },
        update: {},
      }),
  });

  await copyTable({
    name: "Audit",
    read: () => sqlite.audit.findMany(),
    write: (r) =>
      pg.audit.upsert({
        where: { id: r.id },
        create: {
          id: r.id,
          actorId: r.actorId,
          action: r.action,
          entityType: r.entityType,
          entityId: r.entityId,
          oldValues: r.oldValues,
          newValues: r.newValues,
          ip: r.ip,
          userAgent: r.userAgent,
          createdAt: r.createdAt,
        },
        update: {},
      }),
  });
}

main()
  .then(() => console.log("\n✅ Copy complete"))
  .catch((e) => {
    console.error("\n❌ Copy failed\n", e);
    process.exit(1);
  })
  .finally(async () => {
    await sqlite.$disconnect();
    await pg.$disconnect();
  });

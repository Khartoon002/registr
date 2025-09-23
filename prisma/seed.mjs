import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.bot.count();
  if (count > 0) return;
  await prisma.bot.create({
    data: {
      name: "Demo Bot",
      slug: "demo-bot",
      pages: { create: [{ version: 1, html: "<!doctype html><html><head><meta charset='utf-8'><title>Demo Bot v1</title></head><body><h1>Hello from Demo Bot v1</h1></body></html>" }] }
    }
  });
  console.log("Seeded demo bot");
}
main().catch(e => { console.error(e); process.exit(1); }).finally(async () => prisma.$disconnect());
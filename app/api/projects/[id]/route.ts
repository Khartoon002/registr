// app/api/projects/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;

  // Ensure project exists
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    // 1) If Bots are linked to Project, remove their pages then the bots
    const bots = await tx.bot.findMany({
      where: { projectId },            // <-- requires Bot.projectId in schema
      select: { id: true },
    });
    const botIds = bots.map(b => b.id);
    if (botIds.length) {
      await tx.botPage.deleteMany({ where: { botId: { in: botIds } } });
      await tx.bot.deleteMany({ where: { id: { in: botIds } } });
    }

    // 2) Project-scoped data
    await tx.personLink.deleteMany({ where: { projectId } });
    await tx.downline.deleteMany({ where: { projectId } });
    await tx.package.deleteMany({ where: { projectId } });

    // 3) Finally the project
    await tx.project.delete({ where: { id: projectId } });
  });

  return new NextResponse(null, { status: 204 });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [totalProjects, totalPackages, totalDownlines, registrationsLast7Days] =
    await Promise.all([
      prisma.project.count({ where: { deleted: false, archivedAt: null } }),
      prisma.package.count({
        where: { project: { deleted: false, archivedAt: null } },
      }),
      prisma.downline.count({
        where: { Project: { deleted: false, archivedAt: null } },
      }),
      prisma.downline.count({
        where: {
          createdAt: { gte: sevenDaysAgo },
          Project: { deleted: false, archivedAt: null },
        },
      }),
    ]);

  const recent = await prisma.downline.findMany({
    where: {
      createdAt: { gte: sevenDaysAgo },
      Project: { deleted: false, archivedAt: null },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      fullName: true,
      createdAt: true,
      Project: { select: { name: true } },
      Package: { select: { name: true } },
    },
  });

  return NextResponse.json({
    totalProjects,
    totalPackages,
    totalDownlines,
    registrationsLast7Days,
    logs: recent.map((r) => ({
      name: r.fullName,
      projectName: r.Project?.name ?? "",
      packageName: r.Package?.name ?? "",
      date: r.createdAt.toISOString(),
    })),
  });
}

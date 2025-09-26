import { prisma } from "@/lib/db";
import DashboardContent from "./DashboardContent";

export const revalidate = 0;

export default async function DashboardPage() {
  const since = new Date(); since.setDate(since.getDate()-7);

  const [totalProjects,totalPackages,totalDownlines, registrationsLast7Days] = await Promise.all([
    prisma.project.count({ where:{ deleted:false, archivedAt:null }}),
    prisma.package.count({ where:{ project:{ deleted:false, archivedAt:null }} }),
    prisma.downline.count(),
    prisma.personLink.count({ where:{ createdAt:{ gte: since }}}),
  ]);

  const recent = await prisma.downline.findMany({
    orderBy:{ createdAt:"desc" }, take:5,
    select:{ fullName:true, createdAt:true,
      Project:{ select:{ name:true }}, Package:{ select:{ name:true }}
    }
  });

  const initialStats = {
    totalProjects, totalPackages, totalDownlines, registrationsLast7Days,
    logs: recent.map(r=>({
      name: r.fullName,
      projectName: r.Project?.name || "-",
      packageName: r.Package?.name || "-",
      date: r.createdAt.toISOString(),
    }))
  };
  return <DashboardContent initialStats={initialStats} />;
}

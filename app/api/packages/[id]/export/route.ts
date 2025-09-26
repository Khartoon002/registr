import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const packageId = params.id;

  // Grab all downlines for this package (only from non-archived projects)
  const rows = await prisma.downline.findMany({
    where: {
      packageId,
      Project: { deleted: false, archivedAt: null },
    },
    orderBy: { createdAt: "desc" },
    select: {
      fullName: true,
      username: true,
      phone: true,
      email: true,
      uniqueCode: true,
      createdAt: true,
      Project: { select: { name: true } },
      Package: { select: { name: true } },
    },
  });

  let csv = 'Full Name,Username,Phone,Email,Unique Code,Date Registered,Project,Package\n';
  for (const r of rows) {
    const vals = [
      r.fullName ?? "",
      r.username ?? "",
      r.phone ?? "",
      r.email ?? "",
      r.uniqueCode ?? "",
      r.createdAt.toISOString(),
      r.Project?.name ?? "",
      r.Package?.name ?? "",
    ].map(v => `"${String(v).replace(/"/g, '""')}"`);
    csv += vals.join(",") + "\n";
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="package_${packageId}_downlines.csv"`,
    },
  });
}

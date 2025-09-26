import { prisma } from "@/lib/db";
import Table from "./table";

export const revalidate = 0;

export default async function DownlinesPage() {
  const rows = await prisma.downline.findMany({
    where: { Project: { deleted: false, archivedAt: null } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
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

  const data = rows.map(r => ({
    id: r.id,
    name: r.fullName,
    username: r.username,
    phone: r.phone,
    email: r.email ?? "",
    code: r.uniqueCode,
    projectName: r.Project?.name ?? "",
    packageName: r.Package?.name ?? "",
    registered: r.createdAt.toISOString(),
  }));

  return (
    <main className="g-body">
      <div className="g-card">
        <div className="g-row">
          <div>
            <h1 className="g-title">Downlines</h1>
            <p className="g-sub">All registrations across active projects.</p>
          </div>
        </div>
        <Table initialData={data} />
      </div>
    </main>
  );
}

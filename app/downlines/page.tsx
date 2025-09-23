import { prisma } from "@/lib/db";          // if no "@/lib" alias, use: import { prisma } from "../../lib/db";
import DownlinesTable from "./_table";

export default async function DownlinesPage() {
  const rows = await prisma.downline.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, fullName: true, username: true, phone: true, email: true,
      uniqueCode: true, createdAt: true, passwordPlain: true,
      Project: { select: { name: true } },
      Package: { select: { name: true } },
    },
  });

  const items = rows.map(r => ({
    id: r.id,
    fullName: r.fullName,
    username: r.username,
    phone: r.phone,
    email: r.email || "",
    uniqueCode: r.uniqueCode,
    createdAt: r.createdAt.toISOString(),
    password: r.passwordPlain || "",
    projectName: r.Project?.name || "",
    packageName: r.Package?.name || "",
  }));

  return (
    <div className="g-card">
      <div className="g-row">
        <div>
          <h1 className="g-title">Downlines</h1>
          <p className="g-sub">Passwords are visible to admins only. You can export to CSV.</p>
        </div>
        <a className="g-btn" href="/api/downlines/export">Export CSV</a>
      </div>

      <DownlinesTable items={items} />
    </div>
  );
}

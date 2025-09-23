import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import "../../admin/bots/glass.css";
import AddPackageForm from "./_add-package";

export const revalidate = 0;

export default async function ProjectView({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      status: true,
      packages: {
        select: { id: true, name: true, slug: true, status: true },
        orderBy: { createdAt: "desc" }
      },
      // Remove if your Bot doesn’t have projectId relation
      bots: { select: { id: true, name: true, slug: true, isActive: true } }
    },
  });

  if (!project) return notFound();

  return (
    <section className="g-shell">
      <div className="g-body">
        <div className="g-card">
          <h1 className="g-title">{project.name}</h1>
          <p className="g-sub">/{project.slug} — {project.status}</p>
          {project.description && <p style={{ marginTop: 8 }}>{project.description}</p>}

          <div className="g-row" style={{ marginTop: 16 }}>
            {/* 📦 Packages section */}
            <div className="g-card" style={{ flex: 1 }}>
              <div className="g-row" style={{ alignItems: "center" }}>
                <h2 className="g-sub">Packages</h2>
                <div style={{ marginLeft: "auto" }}>
                  {/* No need for ts-expect-error, AddPackageForm should be a client component */}
                  <AddPackageForm projectId={project.id} />
                </div>
              </div>

              <div className="g-table" style={{ marginTop: 8 }}>
                {project.packages.length === 0 && <div className="g-sub">No packages yet.</div>}
                {project.packages.map(p => (
                  <div key={p.id} className="g-table-row" style={{ gridTemplateColumns: "2fr 1fr 1fr" }}>
                    <div><b>{p.name}</b> <span className="g-sub">/{p.slug}</span></div>
                    <div>{p.status}</div>
                    <div className="g-table-actions">
                      <a className="g-btn g-btn-small g-outline" href={`/packages/${p.id}`}>Open</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 🤖 Bots section */}
            <div className="g-card" style={{ flex: 1 }}>
              <h2 className="g-sub">Bots</h2>
              <div className="g-table" style={{ marginTop: 8 }}>
                {!project.bots?.length && <div className="g-sub">No bots linked.</div>}
                {project.bots?.map(b => (
                  <div key={b.id} className="g-table-row" style={{ gridTemplateColumns: "2fr 1fr 1.3fr" }}>
                    <div><b>{b.name}</b> <span className="g-sub">/{b.slug}</span></div>
                    <div>{b.isActive ? "Active" : "Inactive"}</div>
                    <div className="g-table-actions">
                      <a className="g-btn g-btn-small g-outline" href={`/bots/${b.slug}`} target="_blank">Preview</a>
                      <a className="g-btn g-btn-small" href={`/admin/bots/${b.id}`}>Manage</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

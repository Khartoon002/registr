import { prisma } from "@/lib/db";
import "../admin/bots/glass.css";

export const revalidate = 0; // no caching while you iterate

export default async function ProjectsIndex() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, slug: true, status: true, createdAt: true },
  });

  return (
    <section className="g-shell">
      <div className="g-body">
        <div className="g-card">
          <div className="g-row">
            <div>
              <h1 className="g-title">Projects</h1>
              <p className="g-sub">Select a project to manage packages and bots.</p>
            </div>
            {/* add a create-project button later if you want */}
          </div>

          <div className="g-table" style={{ marginTop: 12 }}>
            {projects.length === 0 && <div className="g-sub">No projects yet.</div>}
            {projects.map(p => (
              <div key={p.id} className="g-table-row" style={{ gridTemplateColumns: "2fr 1fr 1fr" }}>
                <div><b>{p.name}</b> <span className="g-sub">/{p.slug}</span></div>
                <div className="g-sub">{p.status}</div>
                <div className="g-table-actions">
                  <a className="g-btn g-btn-small" href={`/projects/${p.id}`}>Open</a>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

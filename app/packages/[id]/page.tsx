import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import "../../admin/bots/glass.css";
import NewLink from "./_new-link";

export const revalidate = 0;

export default async function PackageView({ params }: { params: { id: string } }) {
  const pkg = await prisma.package.findUnique({
    where: { id: params.id },
    select: {
      id: true, name: true, slug: true, status: true, description: true,
      project: { select: { id: true, name: true, slug: true } },
      downlines: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true, fullName: true, username: true, phone: true, email: true,
          uniqueCode: true, createdAt: true, passwordPlain: true
        }
      }
    }
  });
  if (!pkg) return notFound();

  const links = await prisma.personLink.findMany({
    where: { packageId: pkg.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, token: true, forName: true, forPhone: true, oneTime: true, consumedAt: true, createdAt: true }
  });

  return (
    <section className="g-shell">
      <div className="g-body">
        <div className="g-card">
          <div className="g-row">
            <div>
              <h1 className="g-title">{pkg.name}</h1>
              <p className="g-sub">Project: <a href={`/projects/${pkg.project.id}`}>/{pkg.project.slug}</a> — /{pkg.slug} — {pkg.status}</p>
              {pkg.description && <p style={{ marginTop: 8 }}>{pkg.description}</p>}
            </div>
            <a className="g-btn" href={`/api/downlines/export?packageId=${pkg.id}`}>Export CSV</a>
          </div>

          {/* Registration links */}
          <div className="g-card" style={{ marginTop: 14 }}>
            <div className="g-row" style={{ alignItems: "center" }}>
              <h2 className="g-sub">Registration Links</h2>
             
              <div style={{ marginLeft: "auto" }}>
                <NewLink packageId={pkg.id} />
              </div>
            </div>

            <div className="g-table" style={{ marginTop: 8 }}>
              <div className="g-table-head g-table-row" style={{ gridTemplateColumns: "1.6fr 1fr 1fr .9fr 1.1fr 1.2fr" }}>
                <div>Link</div><div>For</div><div>Phone</div><div>One-time</div><div>Status</div><div>Created</div>
              </div>

              {links.length === 0 && <div className="g-sub">No links yet.</div>}
              {links.map(l => {
                const url = `/registrations/${l.token}`;
                const status = l.consumedAt ? "Consumed" : "Active";
                return (
                  <div key={l.id} className="g-table-row" style={{ gridTemplateColumns: "1.6fr 1fr 1fr .9fr 1.1fr 1.2fr" }}>
                    <div><code>{url}</code></div>
                    <div>{l.forName || "-"}</div>
                    <div>{l.forPhone || "-"}</div>
                    <div>{l.oneTime ? "Yes" : "No"}</div>
                    <div className="g-sub">{status}</div>
                    <div className="g-sub">{new Date(l.createdAt).toLocaleString()}</div>
                    <div className="g-table-actions" style={{ gridColumn: "1 / -1", justifyContent: "flex-end" }}>
                      <a className="g-btn g-btn-small g-outline" href={url} target="_blank">Open</a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Downlines */}
          <div className="g-card" style={{ marginTop: 14 }}>
            <h2 className="g-sub">Downlines ({pkg.downlines.length})</h2>
            <div className="g-table" style={{ marginTop: 8 }}>
              <div className="g-table-head g-table-row" style={{ gridTemplateColumns: "1.3fr 1.1fr 1fr 1fr 1.2fr 1fr 1.3fr" }}>
                <div>Name</div><div>Username</div><div>Password</div><div>Phone</div><div>Email</div><div>Code</div><div>Created</div>
              </div>
              {pkg.downlines.length === 0 && <div className="g-sub">No registrations yet.</div>}
              {pkg.downlines.map(d => (
                <div key={d.id} className="g-table-row" style={{ gridTemplateColumns: "1.3fr 1.1fr 1fr 1fr 1.2fr 1fr 1.3fr" }}>
                  <div><b>{d.fullName}</b></div>
                  <div><code>{d.username}</code></div>
                  <div><code>{d.passwordPlain || "-"}</code></div>
                  <div>{d.phone}</div>
                  <div>{d.email || ""}</div>
                  <div><code>{d.uniqueCode}</code></div>
                  <div className="g-sub">{new Date(d.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

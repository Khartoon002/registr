import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
export const revalidate = 0;

export default async function ProjectView({ params }:{ params:{ id:string } }) {
  const project = await prisma.project.findUnique({
    where:{ id: params.id, deleted:false },
    select:{
      id:true, name:true, slug:true, status:true, description:true, archivedAt:true,
      packages:{ orderBy:{ createdAt:"desc" }, select:{ id:true, name:true, slug:true, status:true } },
      bots:{ select:{ id:true, name:true, slug:true, isActive:true } }
    }
  });
  if(!project || project.archivedAt) return notFound();

  return (
    <main className="space-y-6">
      <div>
        <h1 className="g-title">{project.name}</h1>
        <p className="g-sub">/{project.slug} — {project.status}</p>
        {project.description && <p className="mt-2">{project.description}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-sm font-semibold mb-3">Packages</h2>
          <div className="space-y-2">
            {project.packages.length===0 && <p className="g-sub">No packages yet.</p>}
            {project.packages.map(p=>(
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                <div><b>{p.name}</b> <span className="g-sub">/{p.slug}</span></div>
                <a className="g-btn g-btn-small" href={`/packages/${p.id}`}>Open</a>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-sm font-semibold mb-3">Bots</h2>
          <div className="space-y-2">
            {!project.bots?.length && <p className="g-sub">No bots linked.</p>}
            {project.bots?.map(b=>(
              <div key={b.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                <div><b>{b.name}</b> <span className="g-sub">/{b.slug}</span></div>
                <div className="flex gap-2">
                  <a className="g-btn g-btn-small g-outline" href={`/bots/${b.slug}`} target="_blank">Preview</a>
                  <a className="g-btn g-btn-small" href={`/admin/bots/${b.id}`}>Manage</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

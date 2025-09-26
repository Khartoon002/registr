import Link from "next/link";
import { prisma } from "@/lib/db";
export const revalidate = 0;

export default async function ProjectsPage(){
  const rows = await prisma.project.findMany({
    where:{ deleted:false, archivedAt:null },
    orderBy:{ createdAt:"desc" },
    select:{ id:true, name:true, slug:true, status:true,
      _count:{ select:{ packages:true } }
    }
  });

  return (
    <main className="space-y-4">
      <h1 className="g-title">Projects</h1>
      <div className="hidden md:block overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-[680px] w-full text-sm">
          <thead className="bg-white/5 text-white/70">
            <tr><th className="px-4 py-2 text-left">Project</th><th className="px-4 py-2">Packages</th><th className="px-4 py-2">Status</th><th className="px-4 py-2">Actions</th></tr>
          </thead>
          <tbody className="[&_tr]:border-t [&_tr]:border-white/10">
            {rows.map(p=>(
              <tr key={p.id}>
                <td className="px-4 py-2 font-medium">{p.name} <span className="text-white/60">/{p.slug}</span></td>
                <td className="px-4 py-2 text-center">{p._count.packages}</td>
                <td className="px-4 py-2 text-center">{p.status}</td>
                <td className="px-4 py-2"><Link className="g-btn g-btn-small" href={`/projects/${p.id}`}>Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {rows.map(p=>(
          <div key={p.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="font-semibold">{p.name} <span className="text-white/60">/{p.slug}</span></div>
            <div className="text-sm text-white/60 mt-1">Packages: {p._count.packages} · {p.status}</div>
            <div className="mt-2"><Link className="g-btn g-btn-small" href={`/projects/${p.id}`}>Open</Link></div>
          </div>
        ))}
      </div>
    </main>
  );
}

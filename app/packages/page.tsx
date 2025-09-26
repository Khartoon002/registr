import Link from "next/link";
import { prisma } from "@/lib/db";
export const revalidate = 0;

export default async function PackagesPage(){
  const rows = await prisma.package.findMany({
    where:{ project:{ deleted:false, archivedAt:null } },
    orderBy:[{ project:{ name:"asc" } },{ name:"asc" }],
    select:{ id:true, name:true, slug:true, project:{ select:{ id:true, name:true } }, _count:{ select:{ downlines:true } } }
  });

  return (
    <main className="space-y-4">
      <h1 className="g-title">Packages</h1>

      <div className="hidden md:block overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-[720px] w-full text-sm">
          <thead className="bg-white/5 text-white/70">
            <tr><th className="px-4 py-2 text-left">Package</th><th className="px-4 py-2 text-left">Project</th><th className="px-4 py-2">Downlines</th><th className="px-4 py-2 text-left">Actions</th></tr>
          </thead>
          <tbody className="[&_tr]:border-t [&_tr]:border-white/10">
            {rows.map(p=>(
              <tr key={p.id}>
                <td className="px-4 py-2 font-medium">{p.name} <span className="text-white/60">/{p.slug}</span></td>
                <td className="px-4 py-2">{p.project.name}</td>
                <td className="px-4 py-2 text-center">{p._count.downlines}</td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-2">
                    <Link className="g-btn g-btn-small" href={`/packages/${p.id}`}>Open</Link>
                    <a className="g-btn g-btn-small g-outline" href={`/api/packages/${p.id}/export`}>Export CSV</a>
                  </div>
                </td>
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
            <div className="text-sm text-white/80">{p.project.name}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link className="g-btn g-btn-small" href={`/packages/${p.id}`}>Open</Link>
              <a className="g-btn g-btn-small g-outline" href={`/api/packages/${p.id}/export`}>Export CSV</a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

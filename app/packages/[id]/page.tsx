import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import StableTime from "@/app/components/StableTime";
import CopyButton from "@/app/components/Copybuttons";
import NewLink from "./_new-link";

export const revalidate = 0;

export default async function PackageView({ params }: { params: { id: string } }) {
  const pkg = await prisma.package.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      description: true,
      project: { select: { id: true, name: true, slug: true, deleted: true, archivedAt: true } },
      _count: { select: { downlines: true } },
      downlines: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fullName: true,
          username: true,
          phone: true,
          email: true,
          uniqueCode: true,
          passwordPlain: true,
          createdAt: true,
        },
      },
    },
  });

  if (!pkg) return notFound();
  if (pkg.project.deleted || pkg.project.archivedAt) return notFound();

  // Registration links for THIS package
  const links = await prisma.personLink.findMany({
    where: { packageId: pkg.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, token: true, oneTime: true, consumedAt: true, createdAt: true },
  });

  return (
    <main className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{pkg.name}</h1>
          <p className="text-sm text-white/60">
            Project:{" "}
            <a className="underline underline-offset-2" href={`/projects/${pkg.project.id}`}>
              {pkg.project.name}
            </a>{" "}
            · /{pkg.slug} · {pkg.status}
          </p>
          {pkg.description && <p className="mt-2 text-white/80">{pkg.description}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <a className="g-btn g-btn-small g-outline" href={`/api/packages/${pkg.id}/export`}>
            Export CSV
          </a>
          <NewLink packageId={pkg.id} />
        </div>
      </div>

      {/* Links */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Registration Links</h2>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {links.length === 0 && <p className="text-white/60 text-sm">No links yet.</p>}
          {links.map((l) => {
            const url = `/registrations/${l.token}`;
            return (
              <div key={l.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-sm">
                  <span className="text-white/60">Link:</span>{" "}
                  <code className="break-all">{url}</code>
                </div>
                <div className="mt-1 text-sm text-white/80">
                  {l.oneTime ? "One-time" : "Reusable"} · {l.consumedAt ? "Consumed" : "Active"}
                </div>
                <div className="text-xs text-white/60 mt-1">
                  <StableTime iso={l.createdAt.toISOString()} />
                </div>
                <div className="mt-2 flex gap-2">
                  <a className="g-btn g-btn-small" href={url} target="_blank">
                    Open
                  </a>
                  <CopyButton text={url} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-[780px] w-full text-sm">
            <thead className="bg-white/5 text-white/70">
              <tr>
                <th className="px-4 py-2 text-left">Link</th>
                <th className="px-4 py-2 text-left">One-time</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr]:border-t [&_tr]:border-white/10">
              {links.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-white/60" colSpan={5}>
                    No links yet.
                  </td>
                </tr>
              )}
              {links.map((l) => {
                const url = `/registrations/${l.token}`;
                return (
                  <tr key={l.id}>
                    <td className="px-4 py-2">
                      <code className="break-all">{url}</code>
                    </td>
                    <td className="px-4 py-2">{l.oneTime ? "Yes" : "No"}</td>
                    <td className="px-4 py-2">{l.consumedAt ? "Consumed" : "Active"}</td>
                    <td className="px-4 py-2">
                      <StableTime iso={l.createdAt.toISOString()} />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-2">
                        <a className="g-btn g-btn-small" href={url} target="_blank">
                          Open
                        </a>
                        <CopyButton text={url} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Downlines (THIS PACKAGE) */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">
          Downlines (<span className="tabular-nums">{pkg._count.downlines}</span>)
        </h2>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {pkg.downlines.length === 0 && (
            <p className="text-white/60 text-sm">No registrations yet.</p>
          )}
          {pkg.downlines.map((d) => (
            <div key={d.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{d.fullName}</div>
                <span className="text-xs text-white/60">
                  <StableTime iso={d.createdAt.toISOString()} />
                </span>
              </div>
              <div className="mt-1 text-sm text-white/80">
                Code: <code>{d.uniqueCode}</code>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-white/60">User:</span> <code>{d.username}</code>
                </div>
                <div>
                  <span className="text-white/60">Pass:</span>{" "}
                  <code>{d.passwordPlain || "-"}</code>
                </div>
                <div>
                  <span className="text-white/60">Phone:</span> {d.phone}
                </div>
                <div>
                  <span className="text-white/60">Email:</span> {d.email || "-"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-[980px] w-full text-sm">
            <thead className="bg-white/5 text-white/70">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Username</th>
                <th className="px-4 py-2 text-left">Password</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Code</th>
                <th className="px-4 py-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody className="[&_tr]:border-t [&_tr]:border-white/10">
              {pkg.downlines.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-white/60" colSpan={7}>
                    No registrations yet.
                  </td>
                </tr>
              )}
              {pkg.downlines.map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-2 font-medium">{d.fullName}</td>
                  <td className="px-4 py-2">
                    <code>{d.username}</code>
                  </td>
                  <td className="px-4 py-2">
                    <code>{d.passwordPlain || "-"}</code>
                  </td>
                  <td className="px-4 py-2">{d.phone}</td>
                  <td className="px-4 py-2">{d.email || ""}</td>
                  <td className="px-4 py-2">
                    <code>{d.uniqueCode}</code>
                  </td>
                  <td className="px-4 py-2 text-white/70">
                    <StableTime iso={d.createdAt.toISOString()} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

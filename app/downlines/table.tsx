"use client";
import { useMemo, useState } from "react";
import StableTime from "@/app/components/StableTime";

type Row = {
  id: string; name: string; username: string; phone: string; email: string;
  code: string; projectName: string; packageName: string; registered: string;
};

export default function Table({ initialData }: { initialData: Row[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return initialData;
    return initialData.filter(r =>
      r.id.toLowerCase().includes(s) ||
      r.name.toLowerCase().includes(s) ||
      r.username.toLowerCase().includes(s) ||
      r.phone.toLowerCase().includes(s) ||
      r.email.toLowerCase().includes(s) ||
      r.code.toLowerCase().includes(s) ||
      r.projectName.toLowerCase().includes(s) ||
      r.packageName.toLowerCase().includes(s)
    );
  }, [q, initialData]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          className="g-input w-full sm:w-96"
          placeholder="Search name, phone, id, project, package…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* Mobile stacked list */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && <p className="g-sub">No results.</p>}
        {filtered.map(r => (
          <div key={r.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{r.name}</div>
              <span className="text-xs text-white/60"><StableTime iso={r.registered} /></span>
            </div>
            <div className="mt-1 text-sm text-white/80">{r.projectName} · {r.packageName}</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-white/60">User:</span> <code>{r.username}</code></div>
              <div><span className="text-white/60">Code:</span> <code>{r.code}</code></div>
              <div><span className="text-white/60">Phone:</span> {r.phone}</div>
              <div><span className="text-white/60">Email:</span> {r.email || "-"}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop grid-table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-white/5 text-white/70">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Username</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Project</th>
              <th className="px-4 py-2 text-left">Package</th>
              <th className="px-4 py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody className="[&_tr]:border-t [&_tr]:border-white/10">
            {filtered.length === 0 && (
              <tr><td className="px-4 py-4 text-white/60" colSpan={7}>No results.</td></tr>
            )}
            {filtered.map(r => (
              <tr key={r.id} className="align-top">
                <td className="px-4 py-2 font-medium">
                  {r.name} <span className="text-white/60">({r.code})</span>
                </td>
                <td className="px-4 py-2"><code>{r.username}</code></td>
                <td className="px-4 py-2">{r.phone}</td>
                <td className="px-4 py-2">{r.email}</td>
                <td className="px-4 py-2">{r.projectName}</td>
                <td className="px-4 py-2">{r.packageName}</td>
                <td className="px-4 py-2 text-white/70"><StableTime iso={r.registered} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

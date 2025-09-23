"use client";
import { useMemo, useState } from "react";

type Row = {
  id: string;
  fullName: string;
  username: string;
  phone: string;
  email: string;
  uniqueCode: string;
  createdAt: string;
  password: string;
  projectName: string;
  packageName: string;
};

export default function DownlinesTable({ items }: { items: Row[] }) {
  const [q, setQ] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  const filtered = useMemo(() => {
    const qq = q.toLowerCase();
    if (!qq) return items;
    return items.filter(it =>
      (it.fullName + it.username + it.phone + it.email + it.uniqueCode + it.projectName + it.packageName)
        .toLowerCase().includes(qq)
    );
  }, [items, q]);

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1200);
    } catch {}
  }

  return (
    <>
      <div className="g-row" style={{ marginBottom: 10 }}>
        <input
          className="g-input"
          placeholder="Search name, username, phone, code…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        <button className="g-btn g-btn-small g-outline" onClick={() => setShowPw(v => !v)}>
          {showPw ? "Hide passwords" : "Show passwords"}
        </button>
      </div>

      <div className="g-table">
        <div className="g-table-head g-table-row">
          <div>Name</div>
          <div>Username</div>
          <div>Password</div>
          <div>Phone</div>
          <div>Email</div>
          <div>Code</div>
          <div>Project / Package</div>
          <div>Created</div>
          <div className="g-table-actions">Actions</div>
        </div>

        {filtered.map(it => (
          <div key={it.id} className="g-table-row">
            <div><b>{it.fullName}</b></div>
            <div><code>{it.username}</code></div>
            <div>{showPw ? <code>{it.password || "-"}</code> : "••••••"}</div>
            <div>{it.phone}</div>
            <div>{it.email}</div>
            <div><code>{it.uniqueCode}</code></div>
            <div className="g-sub">{it.projectName} / {it.packageName}</div>
            <div className="g-sub">{new Date(it.createdAt).toLocaleString()}</div>
            <div className="g-table-actions">
              <button
                className="g-btn g-btn-small g-outline"
                onClick={() => copy(it.password || "", it.id)}
                disabled={!it.password}
                title={it.password || ""}
              >
                {copiedId === it.id ? "Copied" : "Copy password"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
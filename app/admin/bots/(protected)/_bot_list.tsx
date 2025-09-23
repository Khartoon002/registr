"use client";
import Link from "next/link";
import { useMemo, useState } from "react";

type BotItem = { id: string; name: string; slug: string; isActive: boolean; pages: number };

export default function BotList({ bots }: { bots: BotItem[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const origin = useMemo(() => (typeof window === "undefined" ? "" : window.location.origin), []);

  async function copyLink(url: string, id: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1200);
    } catch {}
  }

  return (
    <div className="g-table">
      <div className="g-table-head g-table-row">
        <div>Name</div>
        <div>Slug</div>
        <div>Status</div>
        <div>Versions</div>
        <div className="g-table-actions">Actions</div>
      </div>

      {bots.map((b) => {
        const publicPath = `/bots/${b.slug}`;
        const publicUrl = origin ? `${origin}${publicPath}` : publicPath;

        return (
          <div className="g-table-row" key={b.id}>
            <div><b>{b.name}</b></div>
            <div><code>/{b.slug}</code></div>
            <div>{b.isActive ? "Active" : "Inactive"}</div>
            <div>{b.pages}</div>
            <div className="g-table-actions">
              <button
                type="button"
                className="g-btn g-btn-small g-outline"
                onClick={() => copyLink(publicUrl, b.id)}
                title={publicUrl}
              >
                {copiedId === b.id ? "Copied" : "Copy link"}
              </button>
              <Link className="g-btn g-btn-small" href={`/admin/bots/${b.id}`}>
                Manage
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

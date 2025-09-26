"use client";

import { useState } from "react";

export default function NewLink({ packageId }: { packageId: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function create() {
    try {
      setBusy(true); setErr(null);
      const res = await fetch("/api/person-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (!res.ok || !data?.url) throw new Error(data?.error || "Failed");
      // Optional: copy immediately
      await navigator.clipboard.writeText(new URL(data.url, location.origin).toString());
    } catch (e: any) {
      setErr(e.message || "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className="g-btn g-btn-small" onClick={create} disabled={busy}>
        {busy ? "Creating…" : "Create Link"}
      </button>
      {err && <span className="text-xs text-red-400">{err}</span>}
    </div>
  );
}

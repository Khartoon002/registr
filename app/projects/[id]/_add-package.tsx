"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddPackageForm({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, name, slug, description }),
    });
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      setName(""); setSlug(""); setDescription("");
      router.refresh(); // re-render server page with new data
    } else {
      const msg = (await res.json().catch(() => null))?.error || "Failed to create package";
      alert(msg);
    }
  }

  if (!open) {
    return (
      <button className="g-btn g-btn-small" onClick={() => setOpen(true)}>
        Add Package
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="g-row" style={{ gap: 8 }}>
      <input className="g-input" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
      <input className="g-input" placeholder="slug" value={slug} onChange={e => setSlug(e.target.value)} required />
      <input className="g-input" placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
      <button className="g-btn g-btn-small" type="submit" disabled={loading}>
        {loading ? "Saving…" : "Save"}
      </button>
      <button type="button" className="g-btn g-btn-small g-outline" onClick={() => setOpen(false)}>Cancel</button>
    </form>
  );
}

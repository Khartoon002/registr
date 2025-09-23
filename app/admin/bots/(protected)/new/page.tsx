"use client";
import { useEffect, useMemo, useRef, useState } from "react";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "").slice(0, 60);
}

export default function NewBot() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [html, setHtml] = useState(
    "<!doctype html>\n<html>\n<head><meta charset='utf-8'><title>New Page</title></head>\n<body>\n<h1>Hello 👋</h1>\n<p>Your bot is live.</p>\n</body>\n</html>"
  );
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement|null>(null);
  const computed = useMemo(()=> slugify(name), [name]);

  useEffect(()=>{ if(!slug) setSlug(computed); }, [computed, slug]);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setHtml(String(reader.result || ""));
    reader.readAsText(f);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/bots-panel/bots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: slug || computed, html })
    });
    setSaving(false);
    if (!res.ok) return alert("Failed to create bot");
    const created = await res.json();
    location.href = `/admin/bots/${created.id}`;
  }

  return (
    <main className="g-body">
      <div className="g-grid">
        <div className="g-card">
          <h1 className="g-title">Create Bot</h1>
          <p className="g-sub">Name, slug and optional initial HTML (supports JS).</p>
          <form onSubmit={submit} className="g-form">
            <label className="g-label">Name</label>
            <input className="g-input" value={name} onChange={e=>setName(e.target.value)} required placeholder="My Bot" />

            <label className="g-label">Slug</label>
            <input className="g-input" value={slug} onChange={e=>setSlug(e.target.value)} placeholder={computed} />

            <label className="g-label">Initial HTML (paste or import .html)</label>
            <textarea className="g-textarea" rows={12} value={html} onChange={e=>setHtml(e.target.value)} />
            <input ref={fileRef} onChange={onFile} type="file" accept=".html,.htm,text/html" />

            <div className="g-actions">
              <button className="g-btn" disabled={saving}>{saving ? "Creating..." : "Create & Publish"}</button>
            </div>
          </form>
        </div>

        <div className="g-card">
          <h2 className="g-sub">Live Preview</h2>
          <iframe className="g-iframe" title="preview" srcDoc={html} />
        </div>
      </div>
    </main>
  );
}

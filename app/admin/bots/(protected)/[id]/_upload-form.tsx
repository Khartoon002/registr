"use client";
import { useRef, useState } from "react";

export default function UploadForm({ botId }: { botId: string }) {
  const [html, setHtml] = useState(
    "<!doctype html>\n<html>\n<head><meta charset='utf-8'><title>New Page</title></head>\n<body>\n<h1>Version update</h1>\n</body>\n</html>"
  );
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

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
    const res = await fetch(`/api/bots-panel/bots/${botId}/pages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html })
    });
    setSaving(false);
    if (res.ok) location.reload();
    else alert("Upload failed");
  }

  return (
    <form onSubmit={submit} className="g-form">
      <textarea className="g-textarea" rows={12} value={html} onChange={e=>setHtml(e.target.value)} />
      <input ref={fileRef} onChange={onFile} type="file" accept=".html,.htm,text/html" />
      <div className="g-actions">
        <button className="g-btn" disabled={saving}>{saving ? "Uploading..." : "Upload as New Version"}</button>
      </div>
    </form>
  );
}

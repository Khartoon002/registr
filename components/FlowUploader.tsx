'use client';

import { useState } from 'react';

export default function FlowUploader({ botId, botSlug, onUploaded }:{ botId?: string; botSlug?: string; onUploaded?: ()=>void }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleUpload(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    if (!fd.get('file')) { setMsg('Choose a .json file'); return; }
    setBusy(true);
    setMsg(null);
    try {
      if (botId) fd.set('botId', botId);
      if (botSlug) fd.set('botSlug', botSlug);
      const res = await fetch('/api/botflows/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Upload failed');
      setMsg(`Flow uploaded. Version: ${data?.flow?.version}`);
      onUploaded?.();
    } catch (e:any) {
      setMsg(e.message);
    } finally {
      setBusy(false);
      (ev.currentTarget.querySelector('input[type=file]') as HTMLInputElement).value = '';
    }
  }

  return (
    <form onSubmit={handleUpload} className="rounded-xl border border-white/10 p-4 bg-white/5 space-y-3">
      <div className="font-semibold">Upload BotFlow JSON</div>
      <input type="file" name="file" accept="application/json" className="block" />
      <div className="text-xs text-white/60">
        Expected format: an array of steps (see example below). Uploading creates a new version automatically.
      </div>
      <button
        className="px-3 py-2 rounded-lg bg-emerald-500 text-black font-semibold disabled:opacity-60"
        disabled={busy}
      >
        {busy ? 'Uploading…' : 'Upload'}
      </button>
      {msg && <div className="text-sm">{msg}</div>}
    </form>
  );
}

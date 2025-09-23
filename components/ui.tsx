'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { clsx } from 'clsx';

/* ---------- types ---------- */
type BotLike = {
  id: string;
  title: string;
  slug: string;
  welcomeMessage: string;
  settings: string | null;
  isActive: boolean;
};

type FlowHistoryItem = {
  id: string;
  version: number;
  steps: string;      // JSON string
  createdAt: string;  // ISO string
};

/** NOTE: `flow` is optional; if not provided we parse it from flows[0].steps */
type EditProps = {
  bot: BotLike;
  flow?: any[];
  flows?: FlowHistoryItem[];   // ← was required, now optional
};

/* ---------- main editor ---------- */
function EditClient({ bot, flow, flows }: EditProps) {
const initialFlow =
  flow ??
  (parseSafe((flows && flows[0]?.steps) || '[]') ?? []);

  const [current, setCurrent] = useState<any[]>(initialFlow);
  const [jsonText, setJsonText] = useState(() => safeStringify(initialFlow));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const parsedOk = useMemo(() => {
    try {
      const v = JSON.parse(jsonText || '[]');
      return Array.isArray(v);
    } catch {
      return false;
    }
  }, [jsonText]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer?.files?.[0];
    if (f) readFile(f);
  }, []);

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const txt = String(reader.result || '');
      setJsonText(txt);
      try {
        const parsed = JSON.parse(txt);
        if (!Array.isArray(parsed)) throw new Error('Flow JSON must be an array');
        setCurrent(parsed);
        setErr(null);
        setMsg(`Loaded ${file.name}`);
      } catch (e: any) {
        setErr(e.message || 'Invalid JSON');
        setMsg(null);
      }
    };
    reader.readAsText(file);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) readFile(f);
    e.currentTarget.value = '';
  };

  const onValidate = () => {
    try {
      const v = JSON.parse(jsonText || '[]');
      if (!Array.isArray(v)) throw new Error('Flow JSON must be an array');
      setCurrent(v);
      setErr(null);
      setMsg('JSON looks valid ✅');
    } catch (e: any) {
      setErr(e.message || 'Invalid JSON');
      setMsg(null);
    }
  };

  const onSaveNewVersion = async () => {
    setBusy(true); setMsg(null); setErr(null);
    try {
      const v = JSON.parse(jsonText || '[]');
      if (!Array.isArray(v)) throw new Error('Flow JSON must be an array');

      const res = await fetch(`/api/bots/${bot.id}/flows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps: v }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed to save');

      setMsg(`Saved as version ${j.item.version} ✅ (refresh to see in list)`);
    } catch (e: any) {
      setErr(e.message || 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const makeSample = () => {
    const demo = [
      { type: 'botText', html: 'Welcome to the Platform 👋' },
      { type: 'card', title: 'Step 1 — Get Started', html: '<p>Register & unlock tasks.</p>' },
      { type: 'card', title: 'Step 2 — Start Earning', html: '<ul><li>Phone jobs</li><li>Streaming</li></ul>' },
      { type: 'action', name: 'askCountry' },
    ];
    setJsonText(safeStringify(demo));
    setCurrent(demo);
    setMsg('Inserted sample flow');
    setErr(null);
  };

  return (
    <main className="max-w-6xl mx-auto p-6">
      {/* header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Edit Bot: {bot.title}</h1>
        <span className="text-xs px-2 py-1 rounded-lg border border-white/10 bg-white/5">slug: {bot.slug}</span>
        <span className="ml-auto text-sm text-white/60">Active: {bot.isActive ? 'Yes' : 'No'}</span>
      </div>

      {/* messages */}
      {(msg || err) && (
        <div className="mt-3 text-sm">
          {msg && (
            <div className="px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
              {msg}
            </div>
          )}
          {err && (
            <div className="px-3 py-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300">
              {err}
            </div>
          )}
        </div>
      )}

      {/* 2 columns: JSON + preview */}
      <div className="grid md:grid-cols-2 gap-4 mt-5">
        {/* LEFT: JSON editor + dropzone */}
        <section>
          <div
            ref={dropRef}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
            }}
            onDrop={onDrop}
            className="rounded-xl border border-dashed border-white/15 p-3 bg-white/5"
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold">Flow JSON</div>
              <div className="flex items-center gap-2">
                <input id="file" type="file" accept="application/json" className="hidden" onChange={onPick} />
                <label
                  htmlFor="file"
                  className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 cursor-pointer text-xs"
                >
                  Upload .json
                </label>
                <button
                  className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs"
                  onClick={makeSample}
                  type="button"
                >
                  Insert sample
                </button>
              </div>
            </div>

            <p className="text-xs text-white/60 mt-1">Drag & drop a JSON file or paste/edit below.</p>

            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              spellCheck={false}
              className="mt-2 w-full h-[380px] rounded-lg bg-black/40 border border-white/10 p-3 font-mono text-xs outline-none"
              placeholder='[ { "type":"botText","html":"Hi" } ]'
            />

            <div className="flex gap-2 mt-3">
              <button
                onClick={onValidate}
                type="button"
                className="px-3 py-2 rounded-lg bg-sky-500/20 border border-sky-400/30 hover:bg-sky-500/30"
              >
                Validate
              </button>
              <button
                onClick={onSaveNewVersion}
                disabled={!parsedOk || busy}
                className="px-3 py-2 rounded-lg bg-emerald-500 text-black font-semibold disabled:opacity-60"
                type="button"
              >
                {busy ? 'Saving…' : 'Save as new version'}
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT: preview + history */}
        <section>
          <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="px-3 py-2 font-semibold bg-white/10">Preview</div>
            <div className="p-3 space-y-3 text-sm">
              {(!current || current.length === 0) && (
                <div className="text-white/60">No steps to preview.</div>
              )}
              {current.map((step, i) => (
                <PreviewItem key={i} step={step} />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden mt-4">
            <div className="px-3 py-2 font-semibold bg-white/10">Versions</div>
            <ul className="divide-y divide-white/10">
              {(flows ?? []).map((f) => (
                <li key={f.id} className="px-3 py-2 flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-lg bg-white/10 border border-white/10">v{f.version}</span>
                  <span className="text-xs text-white/70">
                    {new Date(f.createdAt).toLocaleString()}
                  </span>
                  <span className="ml-auto text-xs text-white/50">
                    {(parseSafe(f.steps)?.length ?? 0) + ''} steps
                  </span>
                </li>
              ))}
              {!(flows && flows.length) && (
                <li className="px-3 py-2 text-white/60 text-sm">No history yet.</li>
              )}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}

export default EditClient;

/* ---------- helpers & your shared UI bits ---------- */

function PreviewItem({ step }: { step: any }) {
  if (!step || typeof step !== 'object') return null;
  if (step.type === 'botText') {
    return (
      <div
        className="rounded-2xl border border-white/10 bg-white/10 p-3"
        dangerouslySetInnerHTML={{ __html: step.html || '' }}
      />
    );
  }
  if (step.type === 'card') {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="px-3 py-2 font-semibold bg-white/10">{step.title || 'Card'}</div>
        <div className="p-3" dangerouslySetInnerHTML={{ __html: step.html || '' }} />
      </div>
    );
  }
  // generic render
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs text-white/50 mb-1">{step.type || 'action'}</div>
      <pre className="text-xs whitespace-pre-wrap break-words">{safeStringify(step)}</pre>
    </div>
  );
}

function safeStringify(v: any) {
  try { return JSON.stringify(v, null, 2); } catch { return '[]'; }
}

// tiny JSON.parse guard
function parseSafe(s: string) {
  try { return JSON.parse(s); } catch { return null; }
}

/* ------ your shared Button/Card/Modal remain intact ------ */

export function Button(
  { className = '', ...props }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }
) {
  return <button className={clsx('btn btn-brand', className)} {...props} />;
}

export function Card(
  { className = '', ...props }:
  React.HTMLAttributes<HTMLDivElement>
) {
  return <div className={clsx('card', className)} {...props} />;
}

export function Modal(
  { open, onClose, title, children }:
  { open: boolean; onClose: () => void; title: string; children: React.ReactNode }
) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="glass rounded-2xl w-full max-w-lg shadow-glow">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

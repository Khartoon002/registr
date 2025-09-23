"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type BotRow = {
  id: string;
  title: string;
  slug: string;
  isActive: boolean;
  welcomeMessage?: string;
  settings?: string; // JSON string
  createdAt?: string;
};

export default function BotsAdminPage() {
  const [items, setItems] = useState<BotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [edit, setEdit] = useState<BotRow | null>(null);
  const [flowJson, setFlowJson] = useState<string>("[]");
  const [flowSaving, setFlowSaving] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/bots", { cache: "no-store" });
      const j = await r.json();
      if (j?.ok) setItems(j.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const [newTitle, setNewTitle] = useState("");
  const [newWelcome, setNewWelcome] = useState("Welcome 👋");
  const [newSettings, setNewSettings] = useState<string>(JSON.stringify(defaultSettings(), null, 2));

  async function createBot() {
    setCreating(true);
    try {
      // validate settings JSON
      let settings: any = {};
      try { settings = JSON.parse(newSettings || "{}"); } catch { alert("Invalid JSON in Settings"); setCreating(false); return; }

      const res = await fetch("/api/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, welcomeMessage: newWelcome, settings })
      });
      const j = await res.json();
      if (!res.ok || !j?.ok) return alert(j?.error || "Failed to create");
      setNewTitle("");
      await load();
    } finally {
      setCreating(false);
    }
  }

  function openEdit(b: BotRow) {
    setEdit(b);
    setFlowJson("[]");
    // fetch latest flow to prefill
    fetch(`/api/bots/${b.slug}`).then(r => r.json()).then(j => {
      if (j?.ok) {
        const steps = j.flow?.steps || "[]";
        setFlowJson(tryPretty(steps));
      }
    }).catch(()=>{});
  }

  async function saveEdit() {
    if (!edit) return;
    let settings: any = {};
    let settingsStr = (document.getElementById("settings") as HTMLTextAreaElement)?.value || "{}";
    try { settings = JSON.parse(settingsStr); } catch { return alert("Invalid JSON in Settings"); }

    const payload = {
      title: (document.getElementById("title") as HTMLInputElement)?.value || "",
      slug:  (document.getElementById("slug") as HTMLInputElement)?.value || "",
      welcomeMessage: (document.getElementById("welcome") as HTMLTextAreaElement)?.value || "",
      isActive: (document.getElementById("active") as HTMLInputElement)?.checked,
      settings
    };

    const res = await fetch(`/api/bots/${edit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const j = await res.json();
    if (!res.ok || !j?.ok) return alert(j?.error || "Save failed");
    setEdit(null);
    await load();
  }

  async function saveFlow(bumpVersion: boolean) {
    if (!edit) return;
    setFlowSaving(true);
    try {
      // validate JSON
      let parsed: any;
      try { parsed = JSON.parse(flowJson || "[]"); } catch { alert("Flow must be valid JSON"); setFlowSaving(false); return; }
      const res = await fetch(`/api/bots/${edit.id}/flows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps: parsed, bumpVersion })
      });
      const j = await res.json();
      if (!res.ok || !j?.ok) return alert(j?.error || "Flow save failed");
      alert(`Saved flow (version ${j.flow.version})`);
    } finally {
      setFlowSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this bot? This also deletes its flows.")) return;
    const res = await fetch(`/api/bots/${id}`, { method: "DELETE" });
    const j = await res.json();
    if (!res.ok || !j?.ok) return alert(j?.error || "Delete failed");
    await load();
  }

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bots</h1>
        <Link className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15" href="/dashboard">Back</Link>
      </div>

      {/* Create */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="font-semibold mb-3">Create Bot</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm opacity-80">Title</label>
              <input value={newTitle} onChange={e=>setNewTitle(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none" />
            </div>
            <div>
              <label className="text-sm opacity-80">Welcome Message</label>
              <textarea value={newWelcome} onChange={e=>setNewWelcome(e.target.value)} rows={3} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none" />
            </div>
          </div>
          <div>
            <label className="text-sm opacity-80">Settings (JSON)</label>
            <textarea value={newSettings} onChange={e=>setNewSettings(e.target.value)} rows={10} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 font-mono text-sm" />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={createBot} disabled={creating || !newTitle.trim()} className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-semibold disabled:opacity-60">
            {creating ? "Creating…" : "Create"}
          </button>
          <button onClick={()=>setNewSettings(JSON.stringify(defaultSettings(), null, 2))} className="px-3 py-2 rounded-xl bg-white/10">Reset default settings</button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/10">
            <tr className="text-left">
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Open</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && (
              <tr><td className="px-3 py-3" colSpan={5}>Loading…</td></tr>
            )}
            {!loading && items.length === 0 && (
              <tr><td className="px-3 py-3 opacity-70" colSpan={5}>No bots yet.</td></tr>
            )}
            {items.map(b=>(
              <tr key={b.id} className="hover:bg-white/[0.04]">
                <td className="px-3 py-2">{b.title}</td>
                <td className="px-3 py-2 font-mono">{b.slug}</td>
                <td className="px-3 py-2">{b.isActive ? <span className="text-emerald-400">Active</span> : <span className="text-yellow-300">Paused</span>}</td>
                <td className="px-3 py-2">
                  <a className="underline" href={`/bot/${b.slug}`} target="_blank">/bot/{b.slug}</a>
                </td>
                <td className="px-3 py-2 text-right">
                  <button onClick={()=>openEdit(b)} className="px-3 py-1 rounded-lg bg-white/10 mr-2">Edit</button>
                  <button onClick={()=>remove(b.id)} className="px-3 py-1 rounded-lg bg-red-500/80">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Drawer */}
      {edit && (
        <div className="fixed inset-0 z-50 bg-black/60 flex">
          <div className="ml-auto w-full max-w-3xl h-full bg-neutral-900 border-l border-white/10 p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Edit Bot</h2>
              <button onClick={()=>setEdit(null)} className="px-3 py-1 rounded-lg bg-white/10">Close</button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm opacity-80">Title</label>
                  <input id="title" defaultValue={edit.title} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none" />
                </div>
                <div>
                  <label className="text-sm opacity-80">Slug</label>
                  <input id="slug" defaultValue={edit.slug} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none font-mono" />
                </div>
                <div className="flex items-center gap-2">
                  <input id="active" type="checkbox" defaultChecked={edit.isActive} />
                  <label htmlFor="active">Active</label>
                </div>
                <div>
                  <label className="text-sm opacity-80">Welcome Message</label>
                  <textarea id="welcome" defaultValue={edit.welcomeMessage || ""} rows={4} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none" />
                </div>
              </div>

              <div>
                <label className="text-sm opacity-80">Settings (JSON)</label>
                <textarea
                  id="settings"
                  defaultValue={tryPretty(edit.settings || "{}")}
                  rows={20}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 font-mono text-sm"
                />
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button onClick={saveEdit} className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-semibold">Save Bot</button>
              <a className="px-3 py-2 rounded-xl bg-white/10" href={`/bot/${edit.slug}`} target="_blank">Open /bot/{edit.slug}</a>
            </div>

            <hr className="my-6 border-white/10" />

            <h3 className="font-semibold mb-2">Flow JSON</h3>
            <textarea
              value={flowJson}
              onChange={e=>setFlowJson(e.target.value)}
              rows={14}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 font-mono text-sm"
              placeholder='[{"type":"botText","html":"Hello!"}]'
            />
            <div className="mt-3 flex gap-2">
              <button onClick={()=>saveFlow(false)} disabled={flowSaving} className="px-4 py-2 rounded-xl bg-white/10">
                {flowSaving ? "Saving…" : "Save (same version)"}
              </button>
              <button onClick={()=>saveFlow(true)} disabled={flowSaving} className="px-4 py-2 rounded-xl bg-blue-500/90">
                {flowSaving ? "Saving…" : "Save as new version"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* helpers */
function tryPretty(s: string) {
  try { return JSON.stringify(JSON.parse(s), null, 2); } catch { return s; }
}
function defaultSettings() {
  return {
    themeDefault: "whatsapp",
    lockUntilQuickForm: true,
    quickForm: {
      title: "Quick Start Form",
      fields: [
        { key: "fullName", label: "Full name", type: "text", required: true },
        { key: "phone",    label: "Phone",     type: "tel",  required: true },
        { key: "gmail",    label: "Gmail",     type: "email",required: false }
      ],
      submitText: "Submit"
    },
    countryBanks: {
      nigeria: { label:"Nigeria", bank:"GTBank", number:"0123456789", name:"Magnus Platform" },
      ghana:   { label:"Ghana",   bank:"GCB",    number:"0234567890", name:"Magnus Platform" }
    },
    contactsVCF: [
      { name: "Nicetopper", phone: "08146573875" },
      { name: "Tramatter",  phone: "07014262728" }
    ],
    copy: {
      intro: "Welcome to Magnus Platform 👋",
      afterFormVideoText: "Follow these steps to save contacts, then continue.",
      countryPrompt: "Reply with your country to get payment details.",
      paymentNote: "After payment, reply here and we’ll verify you."
    },
    countdownMinutes: 20
  };
}

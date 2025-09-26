"use client";

import { useState } from "react";

export default function Form({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [whatsAppUrl, setWhatsAppUrl] = useState<string | null>(null);
  const [vcfUrl, setVcfUrl] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setErr(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      token,
      fullName: String(fd.get("fullName") || ""),
      username: String(fd.get("username") || ""),
      password: String(fd.get("password") || ""),
      phone: String(fd.get("phone") || ""),
      email: String(fd.get("email") || ""),
    };

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Registration failed");

      setOk(true);
      setWhatsAppUrl(data.whatsapp_url || null);
      setVcfUrl(data.vcf_url || null);
      (e.currentTarget as HTMLFormElement).reset();
    } catch (e: any) {
      setErr(e.message || "Error");
    } finally {
      setBusy(false);
    }
  }

  if (ok) {
    return (
      <div className="space-y-3">
        <p className="text-green-400">Registration successful.</p>
        <div className="flex gap-2 flex-wrap">
          {whatsAppUrl && (
            <a className="g-btn g-btn-small" href={whatsAppUrl} target="_blank">
              Open WhatsApp
            </a>
          )}
          {vcfUrl && (
            <a className="g-btn g-btn-small g-outline" href={vcfUrl} target="_blank">
              Save Contact (VCF)
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input name="fullName" placeholder="Full name" className="g-input w-full" required />
      <input name="username" placeholder="Username" className="g-input w-full" required />
      <input name="password" placeholder="Password" className="g-input w-full" required type="password" />
      <input name="phone" placeholder="Phone (e.g. +234...)" className="g-input w-full" required />
      <input name="email" placeholder="Email" className="g-input w-full" required type="email" />

      {err && <p className="text-red-400 text-sm">{err}</p>}

      <button type="submit" className="g-btn" disabled={busy}>
        {busy ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}

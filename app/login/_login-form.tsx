"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

function safeNext(raw?: string) {
  if (!raw) return "/dashboard";                     // <-- default to /dashboard
  try { raw = decodeURIComponent(raw); } catch {}
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  if (raw.startsWith("/login") || raw.startsWith("/admin/bots/login")) return "/dashboard";
  return raw;
}

export default function DashLoginForm({ next }: { next?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = { email: String(fd.get("email") ?? ""), password: String(fd.get("password") ?? "") };

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      cache: "no-store",
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const target = safeNext(next);
      try { router.replace(target); router.refresh(); } 
      catch { window.location.href = target; }
      return;
    }

    const msg = (await res.json().catch(() => null))?.error || "Login failed";
    setError(msg); setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="g-form">
      <label className="g-label">Email</label>
      <input className="g-input" name="email" type="email" required />
      <label className="g-label">Password</label>
      <input className="g-input" name="password" type="password" required />
      {error && <div className="g-sub" style={{ color: "#fca5a5" }}>{error}</div>}
      <div className="g-actions">
        <button className="g-btn" type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Login"}
        </button>
      </div>
    </form>
  );
}
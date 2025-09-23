"use client";
import { useState } from "react";

export default function LoginForm({ next }: { next?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");

    const res = await fetch("/api/bots-panel/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      cache: "no-store",
      body: JSON.stringify({ password })
    });

    if (res.ok) {
      window.location.assign(next || "/admin/bots"); // HARD nav
      return;
    }

    const msg = await res.text().catch(() => "Login failed");
    setError(msg || "Login failed");
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="g-form">
      <label className="g-label">Bots admin password</label>
      <input className="g-input" type="password" name="password" required />
      {error && <div className="g-sub" style={{color:"#fca5a5"}}>{error}</div>}
      <div className="g-actions">
        <button className="g-btn" type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Login"}
        </button>
      </div>
    </form>
  );
}

"use client";
import { useState } from "react";

export default function Form({ token }: { token: string }) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone]       = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [ok, setOk]             = useState<null|{whatsapp_url:string, vcf_url:string}>(null);
  const [err, setErr]           = useState<string|null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ token, fullName, username, password, phone, email })
      });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data?.error || "Registration failed");
      setOk({ whatsapp_url: data.whatsapp_url, vcf_url: data.vcf_url });
    } catch (e:any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (ok) {
    return (
      <div>
        <h2 className="g-sub">✅ Registration successful</h2>
        <div className="g-row" style={{ marginTop: 10 }}>
          <a className="g-btn" href={ok.whatsapp_url} target="_blank" rel="noreferrer">Open WhatsApp</a>
          <a className="g-btn g-outline" href={ok.vcf_url} target="_blank" rel="noreferrer">Download Contact</a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="g-form" style={{ display: "grid", gap: 12 }}>
      {err && <div className="g-sub" style={{ color: "red" }}>{err}</div>}
      <input className="g-input" placeholder="Full name" value={fullName} onChange={e=>setFullName(e.target.value)} required />
      <input className="g-input" placeholder="Username"  value={username} onChange={e=>setUsername(e.target.value)} required />
      <input className="g-input" placeholder="Phone (+234… or digits)" value={phone} onChange={e=>setPhone(e.target.value)} required />
      <input type="email" className="g-input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
      <input type="password" className="g-input" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
      <button className="g-btn" type="submit" disabled={loading}>{loading ? "Submitting…" : "Register"}</button>
    </form>
  );
}

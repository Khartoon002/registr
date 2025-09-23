"use client";
import { useEffect } from "react";
export default function BotsLogout() {
  useEffect(()=>{ fetch("/api/bots-panel/auth/logout",{method:"POST"}).then(()=>location.href="/admin/bots/login"); },[]);
  return <p style={{ padding:24 }}>Logging out…</p>;
}

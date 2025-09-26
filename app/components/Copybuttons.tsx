"use client";
import { useState } from "react";
export default function CopyButton({ text }: { text: string }) {
  const [ok,setOk]=useState(false);
  async function copy(){
    const abs=text.startsWith("http")?text:new URL(text,location.origin).toString();
    await navigator.clipboard.writeText(abs); setOk(true); setTimeout(()=>setOk(false),1200);
  }
  return <button className="g-btn g-btn-small g-outline" onClick={copy}>{ok?"Copied!":"Copy"}</button>;
}

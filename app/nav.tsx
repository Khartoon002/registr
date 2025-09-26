"use client";

import Link from "next/link";
import { useState } from "react";

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0e172a]/80 backdrop-blur border-b border-white/10">
      <nav className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8 h-14">
        <Link href="/dashboard" className="font-semibold tracking-tight">AdminPanel</Link>

        <button
          className="md:hidden rounded p-2 hover:bg-white/5"
          onClick={() => setOpen(v => !v)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <ul className="hidden md:flex gap-6 text-sm">
          <li><Link href="/dashboard">Dashboard</Link></li>
          <li><Link href="/projects">Projects</Link></li>
          <li><Link href="/packages">Packages</Link></li>
          <li><Link href="/downlines">Downlines</Link></li>
          <li><Link href="/admin/bots">Bots</Link></li>
        </ul>
      </nav>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#0b1220]">
          <ul className="px-4 py-3 space-y-2 text-sm">
            <li><Link onClick={()=>setOpen(false)} href="/dashboard">Dashboard</Link></li>
            <li><Link onClick={()=>setOpen(false)} href="/projects">Projects</Link></li>
            <li><Link onClick={()=>setOpen(false)} href="/packages">Packages</Link></li>
            <li><Link onClick={()=>setOpen(false)} href="/downlines">Downlines</Link></li>
            <li><Link onClick={()=>setOpen(false)} href="/admin/bots">Bots</Link></li>
          </ul>
        </div>
      )}
    </header>
  );
}

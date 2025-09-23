// components/Nav.tsx
"use client"
import Link from "next/link"

export default function Nav() {
  return (
    <header className="w-full border-b border-white/10">
      <nav className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-4">
        <Link href="/dashboard" className="font-semibold">Dashboard</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/packages">Packages</Link>
        <div className="ml-auto">
          <a href="/api/auth/logout" className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20">
            Logout
          </a>
        </div>
      </nav>
    </header>
  )
}

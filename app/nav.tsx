
'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Nav() {
  const [theme, setTheme] = useState('dark')
  useEffect(() => {
    const t = localStorage.getItem('theme') || 'dark'
    setTheme(t)
    document.documentElement.classList.toggle('dark', t === 'dark')
  }, [])
  const toggle = () => {
    const t = theme === 'dark' ? 'light' : 'dark'
    setTheme(t)
    localStorage.setItem('theme', t)
    document.documentElement.classList.toggle('dark', t === 'dark')
  }
  return (
    <div className="sticky top-0 z-40 bg-black/40 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/dashboard" className="font-semibold">Dashboard</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/downlines">Downlines</Link>
        <Link href="/admin/bots">Bots</Link>
        <a href="/api/auth/logout" className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20">
  Logout
</a>
        <button onClick={toggle} className="ml-auto px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20">Theme</button>
      </div>
    </div>
  )
}

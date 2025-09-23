"use client"

import Nav from '@/components/nav'
import { Card, Button } from '@/components/ui'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type Downline = {
  id: string
  fullName: string
  username: string
  phone: string
  email?: string | null     // ← add this
  uniqueCode: string
  createdAt: string
}
type PersonLink = {
  id: string
  token: string
  forName?: string | null
  forPhone?: string | null
  oneTime: boolean
  consumedAt?: string | null
  usedByDownlineId?: string | null
  createdAt: string
}

export default function PackageDetail({ params }:{ params:{ id:string } }) {
  const { id: packageId } = params

  const [genLoading, setGenLoading] = useState(false)
  const [downlinesLoading, setDownlinesLoading] = useState(false)
  const [linksLoading, setLinksLoading] = useState(false)

  const [downlines, setDownlines] = useState<Downline[]>([])
  const [links, setLinks] = useState<PersonLink[]>([])

  // --- LOADERS ---
  const loadDownlines = async () => {
    setDownlinesLoading(true)
    try {
      const res = await fetch(`/api/downlines?packageId=${encodeURIComponent(packageId)}`, { cache: 'no-store' })
      const data = await res.json()
      if (data?.ok) setDownlines(data.items)
    } finally {
      setDownlinesLoading(false)
    }
  }

  const loadLinks = async () => {
    setLinksLoading(true)
    try {
      const res = await fetch(`/api/packages/${packageId}/links`, { cache: 'no-store' })
      const data = await res.json()
      if (data?.ok) setLinks(data.items)
    } finally {
      setLinksLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    loadDownlines()
    loadLinks()
  }, [packageId])

  // Auto-refresh every 5s
  const intervalRef = useRef<number | null>(null)
  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      loadDownlines()
      loadLinks()
    }, 5000)
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [packageId])

  // Also refresh when the tab regains focus
  useEffect(() => {
    const onFocus = () => { loadDownlines(); loadLinks() }
    window.addEventListener('visibilitychange', onFocus)
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('visibilitychange', onFocus)
      window.removeEventListener('focus', onFocus)
    }
  }, [packageId])

  // Generate a single person link, copy it, then refresh links list
  const generatePersonLink = async () => {
    try {
      setGenLoading(true)
      const res = await fetch(`/api/packages/${packageId}/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 1, oneTime: true })
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) {
        alert(data?.error || 'Failed to generate link')
        return
      }
      const url = `${window.location.origin}/r/${data.items[0].token}`
      await navigator.clipboard.writeText(url)
      alert(`Link created & copied:\n${url}`)
      loadLinks()
    } catch {
      alert('Network error')
    } finally {
      setGenLoading(false)
    }
  }

  const archiveSoft = async () => {
    const ok = window.confirm('Archive this package? You can unarchive later.')
    if (!ok) return
    const res = await fetch(`/api/packages/${packageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ action: 'archive' })
    })
    if (!res.ok) alert('Archive failed')
  }

  // NEW: Export CSV for this package
  const exportCsv = () => {
    window.location.href = `/api/packages/${packageId}/export`
  }

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    alert('Copied!')
  }

  return (
    <main>
      <Nav />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Package: {packageId}</h1>
          <div className="flex gap-2">
            <Button type="button" onClick={generatePersonLink} disabled={genLoading}>
              {genLoading ? 'Generating…' : 'Generate Person Link'}
            </Button>
            <Button type="button" className="bg-white/10" onClick={() => { loadDownlines(); loadLinks() }}>
              {(downlinesLoading || linksLoading) ? 'Refreshing…' : 'Refresh'}
            </Button>
            <Button type="button" onClick={exportCsv} className="bg-white/10">
              Export CSV
            </Button>
            <Button type="button" onClick={archiveSoft} className="bg-yellow-500/80">
              Archive
            </Button>
          </div>
        </div>

        {/* Links */}
        <Card>
          <h3 className="text-lg font-semibold mb-2">Links</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Token</th>
                <th>For</th>
                <th>Status</th>
                <th>Used By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.length === 0 && (
                <tr><td colSpan={5} className="opacity-70">
                  {linksLoading ? 'Loading…' : 'No links yet. Generate one.'}
                </td></tr>
              )}
              {links.map(l => {
                const url = `${window.location.origin}/r/${l.token}`
                return (
                  <tr key={l.id}>
                    <td className="font-mono">{l.token}</td>
                    <td>{l.forName || '—'} {l.forPhone ? `(${l.forPhone})` : ''}</td>
                    <td>{l.consumedAt ? 'Used' : 'Unused'}</td>
                    <td>{l.usedByDownlineId ? <span className="font-mono">{l.usedByDownlineId.slice(0,8)}…</span> : '—'}</td>
                    <td className="flex gap-2">
                      <button className="px-3 py-1 rounded bg-white/10" onClick={() => copy(url)}>Copy</button>
                      <a className="px-3 py-1 rounded bg-white/10 underline" href={url} target="_blank">Open</a>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>

        {/* Downlines */}
        <Card>
          <h3 className="text-lg font-semibold mb-2">Downlines</h3>
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Username</th><th>Email</th><th>Phone</th><th>Unique ID</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {downlines.length === 0 && (
                <tr><td colSpan={6} className="opacity-70">
                  {downlinesLoading ? 'Loading…' : 'No downlines yet. After they submit the form, they’ll appear here automatically.'}
                </td></tr>
              )}
              {downlines.map(d => (
                <tr key={d.id}>
                  <td>{d.fullName}</td>
                  <td>{d.username}</td>
                  <td>{d.email || '—'}</td>
                  <td>{d.phone}</td>
                  <td className="font-mono">{d.uniqueCode}</td>
                  <td>
                    <a className="px-3 py-1 rounded bg-white/10 underline" href={`/api/contacts/${d.id}`} target="_blank">
                      VCF
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </main>
  )
}

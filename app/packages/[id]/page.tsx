"use client"

import Nav from '@/components/nav'
import { Card, Button } from '@/components/ui'
import { useEffect, useState } from 'react'

type Downline = {
  id: string
  fullName: string
  username: string
  phone: string
  uniqueCode: string
  createdAt: string
}

export default function PackageDetail({ params }:{ params:{ id:string } }) {
  const { id: packageId } = params
  const [loadingGen, setLoadingGen] = useState(false)
  const [loadingTable, setLoadingTable] = useState(false)
  const [downlines, setDownlines] = useState<Downline[]>([])

  const loadDownlines = async () => {
    setLoadingTable(true)
    try {
      const res = await fetch(`/api/downlines?packageId=${encodeURIComponent(packageId)}`, { cache: 'no-store' })
      const data = await res.json()
      if (data?.ok) setDownlines(data.items)
    } finally {
      setLoadingTable(false)
    }
  }

  useEffect(() => { loadDownlines() }, [packageId])

  const generatePersonLink = async () => {
    try {
      setLoadingGen(true)
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
      const url = data.urls?.[0]
      if (url) {
        await navigator.clipboard.writeText(url)
        alert(`Link created & copied:\n${url}`)
      }
      // You’ll see a new downline AFTER someone uses the link to register.
      // Add a manual refresh:
      // await loadDownlines()
    } catch {
      alert('Network error')
    } finally {
      setLoadingGen(false)
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

  return (
    <main>
      <Nav />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Package: {packageId}</h1>
          <div className="flex gap-2">
            <Button type="button" onClick={generatePersonLink} disabled={loadingGen}>
              {loadingGen ? 'Generating…' : 'Generate Person Link'}
            </Button>
            <Button type="button" onClick={loadDownlines} className="bg-white/10">
              {loadingTable ? 'Refreshing…' : 'Refresh'}
            </Button>
            <Button type="button" onClick={archiveSoft} className="bg-yellow-500/80">
              Archive
            </Button>
          </div>
        </div>

        <Card>
          <h3 className="text-lg font-semibold mb-2">Downlines</h3>
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Username</th><th>Phone</th><th>Unique ID</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {downlines.length === 0 && (
                <tr><td colSpan={5} className="opacity-70">
                  {loadingTable ? 'Loading…' : 'No downlines yet. Generate a link and have someone register.'}
                </td></tr>
              )}
              {downlines.map(d => (
                <tr key={d.id}>
                  <td>{d.fullName}</td>
                  <td>{d.username}</td>
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



'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Project = {
  id: string
  name: string
  slug: string
  description?: string | null
  status: string
  defaultWhatsApp?: string | null
  taskerTag?: string | null
  archivedAt?: string | null
  createdAt: string
}

export default function Projects() {
  const [items, setItems] = useState<Project[]>([])
  const [q, setQ] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name:'', slug:'', description:'', defaultWhatsApp:'', taskerTag:'' })
  const [error, setError] = useState<string|null>(null)

  const fetchItems = async () => {
    setLoading(true)
    const res = await fetch(`/api/projects?q=${encodeURIComponent(q)}&archived=${showArchived ? '1':'0'}`)
    const data = await res.json()
    setLoading(false)
    if (data?.ok) setItems(data.items)
  }
  useEffect(() => { fetchItems() }, []) // first load
  useEffect(() => { fetchItems() }, [showArchived]) // toggle

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    if (!data?.ok) { setError(data?.error || 'Failed'); return }
    setShowCreate(false)
    setForm({ name:'', slug:'', description:'', defaultWhatsApp:'', taskerTag:'' })
    fetchItems()
  }

  const doArchive = async (id: string) => {
    const ok = window.confirm('Archive this project? You can unarchive later.')
    if (!ok) return
    await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'archive' })
    })
    fetchItems()
  }

  const doUnarchive = async (id: string) => {
    const ok = window.confirm('Unarchive this project?')
    if (!ok) return
    await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'unarchive' })
    })
    fetchItems()
  }

  const hardDelete = async (id: string, name: string) => {
    // Strong warning flow
    const warn = window.confirm('⚠️ PERMANENT DELETE\nThis will remove the project and ALL related data (packages, downlines, links, bots, flows). This cannot be undone.\n\nContinue?')
    if (!warn) return
    const typed = prompt(`Type DELETE ${name} to confirm permanent deletion.`)
    if (typed !== `DELETE ${name}`) return
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    if (!res.ok) { alert('Delete failed'); return }
    fetchItems()
  }

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm opacity-80">
            <input type="checkbox" checked={showArchived} onChange={e=>setShowArchived(e.target.checked)} />
            Show archived
          </label>
          <button className="btn btn-brand" onClick={()=>setShowCreate(true)}>New Project</button>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          className="glass px-3 py-2 rounded-xl w-full"
          placeholder="Search name or slug…"
          value={q}
          onChange={e=>setQ(e.target.value)}
        />
        <button className="px-4 py-2 rounded-xl bg-white/10" onClick={fetchItems}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Slug</th><th>Status</th><th>Archived</th><th></th></tr>
          </thead>
          <tbody>
            {items.map(p=>(
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.slug}</td>
                <td>{p.status}</td>
                <td>{p.archivedAt ? 'Yes' : 'No'}</td>
                <td className="text-right flex gap-2 justify-end">
                  <Link className="underline text-brand px-2" href={`/projects/${p.id}`}>Open</Link>
                  {!p.archivedAt ? (
                    <button className="px-3 py-1 rounded bg-yellow-500/70" onClick={()=>doArchive(p.id)}>Archive</button>
                  ) : (
                    <button className="px-3 py-1 rounded bg-green-600/70" onClick={()=>doUnarchive(p.id)}>Unarchive</button>
                  )}
                  <button className="px-3 py-1 rounded bg-red-600/80" onClick={()=>hardDelete(p.id, p.name)}>Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="opacity-70">No projects found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card w-full max-w-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Create Project</h3>
              <button className="px-3 py-1 rounded bg-white/10" onClick={()=>setShowCreate(false)}>✕</button>
            </div>
            <form onSubmit={createProject} className="space-y-3">
              <input className="glass px-3 py-2 rounded-xl w-full" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
              <input className="glass px-3 py-2 rounded-xl w-full" placeholder="Slug (unique)" value={form.slug} onChange={e=>setForm({...form, slug:e.target.value})} required />
              <input className="glass px-3 py-2 rounded-xl w-full" placeholder="Description (optional)" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
              <input className="glass px-3 py-2 rounded-xl w-full" placeholder="Default WhatsApp (optional)" value={form.defaultWhatsApp} onChange={e=>setForm({...form, defaultWhatsApp:e.target.value})} />
              <input className="glass px-3 py-2 rounded-xl w-full" placeholder="Tasker Tag (optional)" value={form.taskerTag} onChange={e=>setForm({...form, taskerTag:e.target.value})} />
              {error && <div className="text-red-400 text-sm">{error}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 rounded-xl bg-white/10" onClick={()=>setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-brand">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

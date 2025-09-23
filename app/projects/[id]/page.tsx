'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Package = { id:string; name:string; slug:string; description?:string|null }
type Project = {
  id:string; name:string; slug:string; description?:string|null; status:string;
  defaultWhatsApp?:string|null; taskerTag?:string|null;
  packages: Package[]
}

export default function ProjectDetail({ params }:{ params:{ id:string } }) {
  const { id } = params
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNewPkg, setShowNewPkg] = useState(false)
  const [pkgForm, setPkgForm] = useState({ name:'', slug:'', description:'' })
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState({ name:'', slug:'', description:'', defaultWhatsApp:'', taskerTag:'' })

  const load = async () => {
    setLoading(true)
    const res = await fetch(`/api/projects/${id}`)
    const data = await res.json()
    setLoading(false)
    if (data?.ok) {
      setProject(data.item)
      setForm({
        name: data.item.name || '',
        slug: data.item.slug || '',
        description: data.item.description || '',
        defaultWhatsApp: data.item.defaultWhatsApp || '',
        taskerTag: data.item.taskerTag || ''
      })
    }
  }

  useEffect(() => { load() }, [id])

  const createPackage = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch(`/api/projects/${id}/packages`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(pkgForm)
    })
    const data = await res.json()
    if (!data?.ok) { alert(data?.error || 'Failed'); return }
    setShowNewPkg(false)
    setPkgForm({ name:'', slug:'', description:'' })
    load()
  }

  const updateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch(`/api/projects/${id}`, {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(form)
    })
    const data = await res.json()
    if (!data?.ok) { alert(data?.error || 'Update failed'); return }
    setEdit(false)
    load()
  }

  if (loading) return <main className="p-6">Loading…</main>
  if (!project) return <main className="p-6">Not found</main>

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Project: {project.name}</h1>
        <div className="flex gap-2">
          <button className="btn btn-brand" onClick={()=>setShowNewPkg(true)}>New Package</button>
          <button className="px-4 py-2 rounded-xl bg-white/10" onClick={()=>setEdit(true)}>Edit</button>
        </div>
      </div>

      <div className="card">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="opacity-70 text-sm">Slug</div>
            <div className="font-mono">{project.slug}</div>
          </div>
          <div>
            <div className="opacity-70 text-sm">Tasker Tag</div>
            <div>{project.taskerTag || '—'}</div>
          </div>
          <div>
            <div className="opacity-70 text-sm">Default WhatsApp</div>
            <div>{project.defaultWhatsApp || '—'}</div>
          </div>
          <div>
            <div className="opacity-70 text-sm">Status</div>
            <div>{project.status}</div>
          </div>
        </div>
        {project.description && <p className="mt-3 opacity-80">{project.description}</p>}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-2">Packages</h3>
        <table className="table">
          <thead><tr><th>Name</th><th>Slug</th><th></th></tr></thead>
          <tbody>
            {project.packages.map(pk => (
              <tr key={pk.id}>
                <td>{pk.name}</td>
                <td>{pk.slug}</td>
                <td className="text-right"><Link className="underline text-brand" href={`/packages/${pk.id}`}>Open</Link></td>
              </tr>
            ))}
            {project.packages.length === 0 && (
              <tr><td colSpan={3} className="opacity-70">No packages yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showNewPkg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card w-full max-w-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Create Package</h3>
              <button className="px-3 py-1 rounded bg-white/10" onClick={()=>setShowNewPkg(false)}>✕</button>
            </div>
            <form onSubmit={createPackage} className="space-y-3">
              <input className="glass px-3 py-2 rounded-xl w-full" placeholder="Name" value={pkgForm.name} onChange={e=>setPkgForm({...pkgForm, name:e.target.value})} required />
              <input className="glass px-3 py-2 rounded-xl w-full" placeholder="Slug" value={pkgForm.slug} onChange={e=>setPkgForm({...pkgForm, slug:e.target.value})} required />
              <input className="glass px-3 py-2 rounded-xl w-full" placeholder="Description (optional)" value={pkgForm.description} onChange={e=>setPkgForm({...pkgForm, description:e.target.value})} />
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 rounded-xl bg-white/10" onClick={()=>setShowNewPkg(false)}>Cancel</button>
                <button type="submit" className="btn btn-brand">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {edit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card w-full max-w-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Edit Project</h3>
              <button className="px-3 py-1 rounded bg-white/10" onClick={()=>setEdit(false)}>✕</button>
            </div>
            <form onSubmit={updateProject} className="space-y-3">
              <input className="glass px-3 py-2 rounded-xl w-full" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
              <input className="glass px-3 py-2 rounded-xl w-full" placeholder="Slug" value={form.slug} onChange={e=>setForm({...form, slug:e.target.value})} />
              <input className="glass px-3 py-2 rounded-xl w-full" placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
              <input className="glass px-3 py-2 rounded-xl w-full" placeholder="Default WhatsApp" value={form.defaultWhatsApp} onChange={e=>setForm({...form, defaultWhatsApp:e.target.value})} />
              <input className="glass px-3 py-2 rounded-xl w-full" placeholder="Tasker Tag" value={form.taskerTag} onChange={e=>setForm({...form, taskerTag:e.target.value})} />
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 rounded-xl bg-white/10" onClick={()=>setEdit(false)}>Cancel</button>
                <button type="submit" className="btn btn-brand">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

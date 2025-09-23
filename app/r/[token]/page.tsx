'use client'
import { useState } from 'react'

export default function Register({ params }:{ params:{ token:string } }) {
  const token = params.token
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')      // ← NEW
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const validate = () => {
    if (!fullName || !username || !password || !phone || !email) return 'All fields are required'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Email looks invalid'
    if (phone.replace(/\D/g,'').length < 8) return 'Phone looks invalid'
    return null
  }

  const submitReal = async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/registrations', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ token, fullName, username, password, phone, email }) // ← include email
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) {
        setError(data?.error || 'Failed to register'); setLoading(false); return
      }
      window.location.href = data.whatsapp_url
      window.open(data.vcf_url, '_blank')
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Registration</h1>

      <form onSubmit={(e)=>{e.preventDefault(); const m=validate(); if(m) setError(m); else setConfirmOpen(true)}} className="space-y-3">
        <input className="glass px-3 py-2 rounded-xl w-full" placeholder="Full name" value={fullName} onChange={e=>setFullName(e.target.value)} required />
        <input className="glass px-3 py-2 rounded-xl w-full" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} required />
        <input className="glass px-3 py-2 rounded-xl w-full" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required /> {/* NEW */}
        <input className="glass px-3 py-2 rounded-xl w-full" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <input className="glass px-3 py-2 rounded-xl w-full" placeholder="Phone number" value={phone} onChange={e=>setPhone(e.target.value)} required />
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <button type="submit" className="btn btn-brand w-full" disabled={loading}>
          {loading ? 'Submitting…' : 'Submit'}
        </button>
      </form>

      {confirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card w-full max-w-md space-y-3">
            <h3 className="text-lg font-semibold">Confirm your details</h3>
            <div className="text-sm opacity-90">
              <div><b>Name:</b> {fullName}</div>
              <div><b>Username:</b> {username}</div>
              <div><b>Email:</b> {email}</div>           {/* NEW */}
              <div><b>Phone:</b> {phone}</div>
            </div>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded-xl bg-white/10" onClick={()=>setConfirmOpen(false)}>Go back</button>
              <button className="btn btn-brand" onClick={submitReal}>Looks correct</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

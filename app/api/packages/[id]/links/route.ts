// app/api/packages/[id]/links/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { randomUUID } from 'crypto'

export async function GET(_: NextRequest, { params }:{ params:{ id:string } }) {
  const pkg = await prisma.package.findUnique({ where: { id: params.id } })
  if (!pkg) return NextResponse.json({ ok:false, error:'Package not found' }, { status:404 })

  const links = await prisma.personLink.findMany({
    where: { packageId: params.id },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json({ ok:true, items: links })
}

export async function POST(req: NextRequest, { params }:{ params:{ id:string } }) {
  const pkg = await prisma.package.findUnique({ where: { id: params.id } })
  if (!pkg) return NextResponse.json({ ok:false, error:'Package not found' }, { status:404 })

  const body = await req.json().catch(()=> ({}))
  const count   = Math.max(1, Math.min(50, Number(body?.count ?? 1)))
  const forName = body?.forName || null
  const forPhone= body?.forPhone || null
  const oneTime = body?.oneTime ?? true

  const base = process.env.APP_BASE_URL || 'http://localhost:3000'

  const results = await prisma.$transaction(async (tx) => {
    const created = []
    for (let i=0;i<count;i++) {
      const token = randomUUID().replace(/-/g,'').slice(0,24)
      created.push(await tx.personLink.create({
        data: { token, projectId: pkg.projectId, packageId: pkg.id, forName, forPhone, oneTime }
      }))
    }
    return created
  })

  const urls = results.map(r => `${base}/r/${r.token}`)
  return NextResponse.json({ ok:true, items: results, urls })
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest, { params }:{ params:{ id:string } }) {
  const projectId = params.id
  const { name, slug, description } = await req.json()
  if (!name || !slug) {
    return NextResponse.json({ ok:false, error:'name and slug are required' }, { status:400 })
  }
  // ensure project exists and not deleted
  const proj = await prisma.project.findUnique({ where: { id: projectId } })
  if (!proj || proj.deleted) return NextResponse.json({ ok:false, error:'Project not found' }, { status:404 })

  const pkg = await prisma.package.create({
    data: { name, slug, description: description || null, projectId }
  })
  return NextResponse.json({ ok:true, item: pkg })
}

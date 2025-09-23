import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').trim()
  const includeArchived = searchParams.get('archived') === '1'

  const where: any = {}
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { slug: { contains: q, mode: 'insensitive' } },
    ]
  }
  if (!includeArchived) {
    where.archivedAt = null
  }

  const items = await prisma.project.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ ok: true, items })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, slug, description, defaultWhatsApp, taskerTag } = body

  if (!name || !slug) {
    return NextResponse.json({ ok:false, error:'name and slug are required' }, { status: 400 })
  }

  const created = await prisma.project.create({
    data: {
      name,
      slug,
      description: description || null,
      defaultWhatsApp: defaultWhatsApp || null,
      taskerTag: taskerTag || null,
      createdById: 'admin',
    }
  })
  return NextResponse.json({ ok:true, item: created })
}

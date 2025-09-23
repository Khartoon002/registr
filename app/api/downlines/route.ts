// app/api/downlines/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').trim()
  const packageId = searchParams.get('packageId') || undefined
  const projectId = searchParams.get('projectId') || undefined

  const where: any = {}
  if (packageId) where.packageId = packageId
  if (projectId) where.projectId = projectId
  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: 'insensitive' } },
      { username: { contains: q, mode: 'insensitive' } },
      { phone:    { contains: q, mode: 'insensitive' } },
      { uniqueCode:{ contains: q, mode: 'insensitive' } },
      { email:    { contains: q, mode: 'insensitive' } },   // ← add email to search (optional)
    ]
  }

  const items = await prisma.downline.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      fullName: true,
      username: true,
      phone: true,
      email: true,              // ← IMPORTANT: include email
      uniqueCode: true,
      createdAt: true,
      Package: { select: { id: true, name: true, slug: true } },
      Project: { select: { id: true, name: true, slug: true } },
    }
  })

  return NextResponse.json({ ok: true, items })
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

function esc(s: any) {
  if (s === null || s === undefined) return ''
  const str = String(s)
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

export async function GET(_: NextRequest, { params }:{ params:{ id:string } }) {
  const packageId = params.id

  const pkg = await prisma.package.findUnique({
    where: { id: packageId },
    select: { id:true, name:true, slug:true, project: { select: { id:true, name:true, slug:true } } }
  })
  if (!pkg) return new NextResponse('Package not found', { status:404 })

  const rows = await prisma.downline.findMany({
    where: { packageId },
    orderBy: { createdAt: 'desc' },
    select: {
      fullName: true,
      username: true,
      email: true,
      phone: true,
      uniqueCode: true,
      createdAt: true,
    }
  })

  const header = [
    'Project', 'ProjectSlug',
    'Package', 'PackageSlug',
    'FullName', 'Username', 'Email', 'Phone', 'UniqueID', 'CreatedAt'
  ].join(',')

  const lines = rows.map(r => [
    esc(pkg.project?.name || ''),
    esc(pkg.project?.slug || ''),
    esc(pkg.name),
    esc(pkg.slug),
    esc(r.fullName),
    esc(r.username),
    esc(r.email ?? ''),
    esc(r.phone),
    esc(r.uniqueCode),
    esc(r.createdAt.toISOString()),
  ].join(','))

  const csv = [header, ...lines].join('\n')
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${pkg.slug || 'package'}-downlines.csv"`
    }
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_: NextRequest, { params }:{ params:{ id:string } }) {
  const dl = await prisma.downline.findUnique({ where: { id: params.id } })
  if (!dl) return new NextResponse('Not found', { status:404 })

  const project = await prisma.project.findUnique({ where: { id: dl.projectId } })
  const pkg     = await prisma.package.findUnique({ where: { id: dl.packageId } })

  const org = `${project?.name || 'Project'} / ${pkg?.name || 'Package'}`
  const fullName = `${dl.fullName} (${dl.uniqueCode})`

  const vcf = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${fullName};;;;`,
    `FN:${fullName}`,
    `ORG:${org}`,
    `TEL;TYPE=CELL:${dl.phone}`,
    `NOTE:ID=${dl.uniqueCode}`,
    'END:VCARD'
  ].join('\r\n')

  return new NextResponse(vcf, {
    status: 200,
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${dl.uniqueCode}.vcf"`
    }
  })
}

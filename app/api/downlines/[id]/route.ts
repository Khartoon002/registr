import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_: NextRequest, { params }:{ params:{ id:string } }) {
  const dl = await prisma.downline.findUnique({ where: { id: params.id } })
  if (!dl) return NextResponse.json({ ok:false, error:'Not found' }, { status:404 })
  return NextResponse.json({ ok:true, item: dl })
}

export async function PATCH(req: NextRequest, { params }:{ params:{ id:string } }) {
  const body = await req.json()
  const { fullName, username, phone } = body
  const updated = await prisma.downline.update({
    where: { id: params.id },
    data: {
      ...(fullName !== undefined ? { fullName } : {}),
      ...(username !== undefined ? { username } : {}),
      ...(phone !== undefined ? { phone } : {}),
    }
  })
  return NextResponse.json({ ok:true, item: updated })
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_: NextRequest, { params }:{ params:{ id:string } }) {
  const item = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      packages: { where: { deleted: false }, orderBy: { createdAt: 'desc' } }
    }
  })
  if (!item) return NextResponse.json({ ok:false, error:'Not found' }, { status:404 })
  return NextResponse.json({ ok:true, item })
}

/**
 * PATCH with { action: 'archive' | 'unarchive' } OR partial fields to edit.
 */
export async function PATCH(req: NextRequest, { params }:{ params:{ id:string } }) {
  const body = await req.json().catch(()=> ({}))
  const { action } = body as { action?: 'archive'|'unarchive' }

  if (action === 'archive') {
    const updated = await prisma.project.update({
      where: { id: params.id },
      data: { archivedAt: new Date() }
    })
    return NextResponse.json({ ok:true, item: updated })
  }
  if (action === 'unarchive') {
    const updated = await prisma.project.update({
      where: { id: params.id },
      data: { archivedAt: null }
    })
    return NextResponse.json({ ok:true, item: updated })
  }

  // Normal edit
  const { name, slug, description, defaultWhatsApp, taskerTag, status } = body
  const updated = await prisma.project.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(defaultWhatsApp !== undefined ? { defaultWhatsApp } : {}),
      ...(taskerTag !== undefined ? { taskerTag } : {}),
      ...(status !== undefined ? { status } : {}),
    }
  })
  return NextResponse.json({ ok:true, item: updated })
}

/**
 * HARD DELETE:
 * Permanently delete project and all related entities (bots, flows, links, downlines, packages).
 * This is irreversible.
 */
export async function DELETE(_: NextRequest, { params }:{ params:{ id:string } }) {
  const projectId = params.id

  // collect related entities, then delete in dependency order
  const bots = await prisma.bot.findMany({ where: { projectId } })
  const botIds = bots.map(b => b.id)

  await prisma.$transaction(async (tx) => {
    if (botIds.length) {
      await tx.botFlow.deleteMany({ where: { botId: { in: botIds } } })
      await tx.bot.deleteMany({ where: { id: { in: botIds } } })
    }
    await tx.personLink.deleteMany({ where: { projectId } })
    await tx.downline.deleteMany({ where: { projectId } })
    await tx.package.deleteMany({ where: { projectId } })
    await tx.project.delete({ where: { id: projectId } })
  })

  return NextResponse.json({ ok:true })
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }:{ params:{ id:string } }) {
  const body = await req.json().catch(()=> ({}))
  const { action } = body as { action?: 'archive'|'unarchive' }
  if (action === 'archive') {
    const updated = await prisma.package.update({ where: { id: params.id }, data: { archivedAt: new Date() } })
    return NextResponse.json({ ok:true, item: updated })
  }
  if (action === 'unarchive') {
    const updated = await prisma.package.update({ where: { id: params.id }, data: { archivedAt: null } })
    return NextResponse.json({ ok:true, item: updated })
  }
  // edits if you want later…
  return NextResponse.json({ ok:false, error:'No action' }, { status:400 })
}

export async function DELETE(_: NextRequest, { params }:{ params:{ id:string } }) {
  const packageId = params.id
  await prisma.$transaction(async (tx) => {
    await tx.personLink.deleteMany({ where: { packageId } })
    await tx.downline.deleteMany({ where: { packageId } })
    await tx.package.delete({ where: { id: packageId } })
  })
  return NextResponse.json({ ok:true })
}

const generatePersonLink = async (packageId: string) => {
  try {
    const res = await fetch(`/api/packages/${packageId}/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: 1, oneTime: true })
    });
    const data = await res.json();
    if (!res.ok || !data?.ok) {
      alert(data?.error || 'Failed to generate link');
      return;
    }
    const url = data.urls?.[0];
    if (url) {
      await navigator.clipboard.writeText(url);
      alert(`Link created & copied:\n${url}`);
    }
    // refresh the links table if you render it
    // if (typeof load === 'function') load(); // Removed to fix error
  } catch (e) {
    alert('Network error');
  }
};


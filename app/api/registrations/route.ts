export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { token, fullName, username, password, phone, email } = await req.json();

    // 1) Validate body (your rules: all required)
    if (!token || !fullName || !username || !password || !phone || !email) {
      return NextResponse.json({ ok:false, error:'Missing fields' }, { status:400 });
    }

    // 2) Validate link
    const link = await prisma.personLink.findUnique({ where: { token } });
    if (!link) {
      return NextResponse.json({ ok:false, error:'Invalid or expired link' }, { status:400 });
    }
    if (link.oneTime && link.consumedAt) {
      return NextResponse.json({ ok:false, error:'This link has already been used' }, { status:400 });
    }

    // 3) Create downline
    const passwordHash = await bcrypt.hash(password, 12);
    const downline = await prisma.downline.create({
      data: {
        projectId: link.projectId,
        packageId: link.packageId,
        fullName,
        username,
        passwordHash,
        passwordPlain: password, // store raw password
        phone,
        email,
        uniqueCode: token,       // (as requested)
      },
    });

    // 4) Mark link consumed
    await prisma.personLink.update({
      where: { id: link.id },
      data: { consumedAt: new Date(), usedByDownlineId: downline.id },
    });

    // 5) Build WhatsApp + VCF
    const project = await prisma.project.findUnique({ where: { id: link.projectId } });
    const pkg     = await prisma.package.findUnique({ where: { id: link.packageId } });

    const msg = [
      '[MAGNUS] REG_OK',
      `PROJ:${project?.slug || link.projectId}`,
      `PKG:${pkg?.slug || link.packageId}`,
      `ID:${downline.uniqueCode}`,
      `NAME:${downline.fullName}`,
      `PHONE:${downline.phone}`,
      `EMAIL:${downline.email}`,
      `TAG:${(project as any)?.taskerTag || ''}`,
    ].join('\n');

    const number = (project as any)?.defaultWhatsApp || process.env.DEFAULT_WHATSAPP_NUMBER || '2347037195976';
    const whatsapp_url = `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
    const base = process.env.APP_BASE_URL || 'http://localhost:3000';
    const vcf_url = `${base}/api/contacts/${downline.id}`;

    // 6) AutoRemote minimal payload (name + phone) in your exact format
    try {
      const key = process.env.AUTOREMOTE_KEY; // set in env
      if (!key) {
        console.warn('AUTOREMOTE_KEY missing in .env');
      } else {
        const name = (downline.fullName || '').trim();
        let phoneStr = (downline.phone || '').trim();
        if (phoneStr && !phoneStr.startsWith('+')) phoneStr = `+${phoneStr}`;
        // EXACT delimiter ": :"
        const arMessage = `lead:=:${name}: :${phoneStr}`;
        const url = `https://autoremotejoaomgcd.appspot.com/sendmessage?key=${encodeURIComponent(key)}&message=${encodeURIComponent(arMessage)}`;
        fetch(url).catch(() => {});
      }
    } catch (e) {
      console.error('AutoRemote send failed:', e);
    }

    // 7) Done
    return NextResponse.json({ ok:true, whatsapp_url, vcf_url, downlineId: downline.id });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ ok:false, error:'Username already exists' }, { status:409 });
    }
    console.error('REG_ERROR', err);
    return NextResponse.json({ ok:false, error:'Server error' }, { status:500 });
  }
}

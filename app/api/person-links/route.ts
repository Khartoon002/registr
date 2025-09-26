// app/api/person-links/route.ts  (if you don’t already have it)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function genToken() {
  return Math.random().toString(36).slice(2,10) + Math.random().toString(36).slice(2,6);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const packageId = String(body?.packageId || "");
  if (!packageId) return NextResponse.json({ error: "packageId is required" }, { status: 400 });

  const pkg = await prisma.package.findUnique({ where: { id: packageId }, select: { id: true, projectId: true } });
  if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });

  const token = genToken();
  const link = await prisma.personLink.create({
    data: { token, projectId: pkg.projectId, packageId: pkg.id, oneTime: true },
    select: { token: true, id: true },
  });

  return NextResponse.json({ ok: true, id: link.id, token: link.token, url: `/registrations/${link.token}` }, { status: 201 });
}

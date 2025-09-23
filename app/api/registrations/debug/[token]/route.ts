import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { token: string } }) {
  const link = await prisma.personLink.findUnique({ where: { token: params.token }});
  if (!link) return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, link });
}
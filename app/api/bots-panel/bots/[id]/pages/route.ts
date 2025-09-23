import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";
import { z } from "zod";
function authed(req: Request) {
  const m = /\bbots_admin=([^;]+)/.exec(req.headers.get("cookie") || "");
  return process.env.BOTS_ADMIN_TOKEN && m?.[1] === process.env.BOTS_ADMIN_TOKEN;
}
const Body = z.object({ html: z.string().min(1) });
export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!authed(req)) return new NextResponse("Unauthorized", { status: 401 });
  const p = Body.safeParse(await req.json());
  if (!p.success) return new NextResponse("Bad Request", { status: 400 });
  const latest = await prisma.botPage.findFirst({ where: { botId: params.id }, orderBy: { version: "desc" }, select: { version: true } });
  const page = await prisma.botPage.create({ data: { botId: params.id, version: (latest?.version ?? 0) + 1, html: p.data.html } });
  return NextResponse.json(page, { status: 201 });
}
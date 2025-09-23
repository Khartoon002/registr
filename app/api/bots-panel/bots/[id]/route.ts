import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { z } from "zod";
function authed(req: Request) {
  const m = /\bbots_admin=([^;]+)/.exec(req.headers.get("cookie") || "");
  return process.env.BOTS_ADMIN_TOKEN && m?.[1] === process.env.BOTS_ADMIN_TOKEN;
}
const Update = z.object({ name: z.string().min(2).optional(), slug: z.string().min(2).optional(), isActive: z.boolean().optional() });
export async function GET(req: Request, { params }: { params: { id: string } }) {
  if (!authed(req)) return new NextResponse("Unauthorized", { status: 401 });
  const bot = await prisma.bot.findUnique({ where: { id: params.id } });
  return bot ? NextResponse.json(bot) : new NextResponse("Not found", { status: 404 });
}
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!authed(req)) return new NextResponse("Unauthorized", { status: 401 });
  const p = Update.safeParse(await req.json());
  if (!p.success) return new NextResponse("Bad Request", { status: 400 });
  return NextResponse.json(await prisma.bot.update({ where: { id: params.id }, data: p.data }));
}
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!authed(req)) return new NextResponse("Unauthorized", { status: 401 });
  await prisma.bot.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
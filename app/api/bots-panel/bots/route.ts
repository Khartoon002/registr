import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";           // adjust if you keep lib/ under src/
import { slugify } from "../../../../lib/slugify";
import { z } from "zod";

function authed(req: Request) {
  const m = /\bbots_admin=([^;]+)/.exec(req.headers.get("cookie") || "");
  return process.env.BOTS_ADMIN_TOKEN && m?.[1] === process.env.BOTS_ADMIN_TOKEN;
}

const Create = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  html: z.string().optional(),
  projectId: z.string().optional()
});

export async function GET(req: Request) {
  if (!authed(req)) return new NextResponse("Unauthorized", { status: 401 });
  const bots = await prisma.bot.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(bots);
}

export async function POST(req: Request) {
  if (!authed(req)) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const p = Create.safeParse(body);
  if (!p.success) return new NextResponse("Bad Request", { status: 400 });

  const slug = slugify(p.data.slug ?? p.data.name);
  const bot = await prisma.bot.create({
    data: {
      name: p.data.name,
      slug,
      ...(p.data.projectId ? { projectId: p.data.projectId } : {})
    }
  });

  if (p.data.html && p.data.html.trim()) {
    await prisma.botPage.create({
      data: { botId: bot.id, version: 1, html: p.data.html }
    });
  }
  return NextResponse.json(bot, { status: 201 });
}
import { prisma } from "../../../lib/db";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const bot = await prisma.bot.findUnique({ where: { slug: params.slug } });
  if (!bot || !bot.isActive) return new Response("Not found", { status: 404 });

  const page = await prisma.botPage.findFirst({
    where: { botId: bot.id },
    orderBy: { version: "desc" },
    select: { html: true }
  });
  if (!page) return new Response("No page", { status: 404 });

  // Raw HTML response so your <script> and JS features run as-is.
  return new Response(page.html, { headers: { "content-type": "text/html; charset=utf-8" } });
}

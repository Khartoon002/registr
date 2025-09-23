import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function BotSlugPage({ params }: { params: { slug: string } }) {
  const bot = await prisma.bot.findUnique({ where: { slug: params.slug } });
  if (!bot || !bot.isActive) return notFound();
  const page = await prisma.botPage.findFirst({
    where: { botId: bot.id },
    orderBy: { version: "desc" },
    select: { html: true }
  });
  if (!page) return notFound();
  return new Response(page.html, { headers: { "content-type": "text/html; charset=utf-8" } }) as any;
}
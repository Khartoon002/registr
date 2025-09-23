import { prisma } from "../../../../../../../lib/db";
export async function GET(_req: Request, { params }: { params: { id: string, version: string } }) {
  const v = Number(params.version);
  const page = await prisma.botPage.findFirst({ where: { botId: params.id, version: v } });
  if (!page) return new Response("Not found", { status: 404 });
  return new Response(page.html, {
    headers: { "content-type": "text/html; charset=utf-8", "content-disposition": `attachment; filename="bot-${params.id}-v${v}.html"` }
  });
}

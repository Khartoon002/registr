import Link from "next/link";
// If you don't use "@/lib", keep this relative path:
import { prisma } from "../../../../lib/db";
import BotList from "./_bot_list";

export default async function BotsIndex() {
  const bots = await prisma.bot.findMany({
    orderBy: { createdAt: "desc" },
    // use ONLY `select` — no `include`
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      // get page ids and count them client-side to avoid _count typing issues
      pages: { select: { id: true } },
    },
  });

  const items = bots.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    isActive: b.isActive,
    pages: b.pages.length,
  }));

  return (
    <main className="g-body">
      <div className="g-card">
        <div className="g-row">
          <div>
            <h1 className="g-title">Bots</h1>
            <p className="g-sub">Your published bots. Copy the public link or open the manager.</p>
          </div>
          <Link href="/admin/bots/new" className="g-btn">New Bot</Link>
        </div>

        <BotList bots={items} />
      </div>
    </main>
  );
}
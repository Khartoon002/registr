import Link from "next/link";
// If you don’t use "@/lib" alias, use "../../../../../lib/db"
import { prisma } from "../../../../../lib/db";
import UploadForm from "./_upload-form";
import { notFound } from "next/navigation";

export default async function Manage({ params }: { params: { id: string } }) {
  const bot = await prisma.bot.findUnique({
    where: { id: params.id },
    select: {
      id: true, name: true, slug: true, isActive: true,
      pages: { orderBy: { version: "desc" }, select: { id: true, version: true, createdAt: true, html: true } }
    }
  });
  if (!bot) return notFound();
  const latest = bot.pages[0];

  return (
    <main className="g-body g-grid">
      <div className="g-card">
        <h1 className="g-title">Manage Bot</h1>
        <div className="g-sub">/{bot.slug} — {bot.pages.length} versions</div>

        <details open className="g-card" style={{ padding: 12 }}>
          <summary><b>Upload New Version</b></summary>
          {/* @ts-ignore */}
          <UploadForm botId={bot.id} />
        </details>

        <h2 className="g-sub" style={{ marginTop: 10 }}>Versions</h2>
        <ol className="g-list">
          {bot.pages.map(p => (
            <li key={p.id} className="g-item">
              <div>v{p.version} — {p.createdAt.toISOString()}</div>
              <div><Link href={`/api/bots-panel/bots/${bot.id}/pages/${p.version}`}>download</Link></div>
            </li>
          ))}
        </ol>
      </div>

      <div className="g-card">
        <h2 className="g-sub">Latest Preview (v{latest?.version ?? "-"})</h2>
        <iframe className="g-iframe" title="preview" srcDoc={latest?.html ?? "<p>No page yet</p>"} />
      </div>
    </main>
  );
}
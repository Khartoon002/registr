import { prisma } from "@/lib/db";

function esc(v: any) {
  const s = String(v ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
  const rows = await prisma.downline.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      fullName: true, username: true, phone: true, email: true,
      uniqueCode: true, createdAt: true, passwordPlain: true,
      Project: { select: { name: true } },
      Package: { select: { name: true } },
    },
  });

  const header = [
    "Full Name","Username","Password","Phone","Email","Unique Code",
    "Project","Package","Created At"
  ];

  const lines = rows.map(r => [
    r.fullName,
    r.username,
    r.passwordPlain || "",
    r.phone,
    r.email || "",
    r.uniqueCode,
    r.Project?.name || "",
    r.Package?.name || "",
    r.createdAt.toISOString(),
  ].map(esc).join(","));

  const csv = [header.map(esc).join(","), ...lines].join("\r\n");
  const dt = new Date();
  const filename = `downlines-${dt.getFullYear()}${String(dt.getMonth()+1).padStart(2,"0")}${String(dt.getDate()).padStart(2,"0")}.csv`;

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    }
  });
}

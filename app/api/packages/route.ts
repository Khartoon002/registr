import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const projectId = String(body?.projectId || "");
  const name = String(body?.name || "").trim();
  const slug = String(body?.slug || "").trim();
  const description = (body?.description ? String(body.description) : null);

  if (!projectId || !name || !slug) {
    return NextResponse.json({ error: "projectId, name and slug are required" }, { status: 400 });
    }

  // ensure project exists
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  try {
    const pkg = await prisma.package.create({
      data: { projectId, name, slug, description, status: "active" },
      select: { id: true },
    });
    return NextResponse.json({ ok: true, id: pkg.id }, { status: 201 });
  } catch (e: any) {
    // likely unique slug per project; customize if you add a constraint
    return NextResponse.json({ error: e?.message || "Failed to create package" }, { status: 500 });
  }
}

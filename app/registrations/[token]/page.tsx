// app/registrations/[token]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import "../../admin/bots/glass.css";
import Form from "./_form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RegistrationPage({ params }: { params: { token: string } }) {
  const link = await prisma.personLink.findUnique({
    where: { token: params.token },
    select: {
      id: true,
      token: true,
      oneTime: true,
      consumedAt: true,
      createdAt: true,
      projectId: true,
      packageId: true,
      project: { select: { name: true } }, // relations are lower-case
      package: { select: { name: true } },
    },
  });

  if (!link) return notFound();
  if (link.oneTime && link.consumedAt) return notFound();

  return (
    <section className="g-shell">
      <div className="g-body">
        <div className="g-card" style={{ maxWidth: 640, margin: "0 auto" }}>
          <h1 className="g-title">Register for {link.package?.name ?? "Package"}</h1>
          <p className="g-sub">Project: {link.project?.name ?? "-"}</p>
          <Form token={link.token} />
        </div>
      </div>
    </section>
  );
}

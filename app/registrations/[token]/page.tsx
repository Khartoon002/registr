// app/registrations/[token]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Form from "./_form";

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
      project: { select: { name: true } }, // ✅ lowercase
      package: { select: { name: true } }, // ✅ lowercase
    },
  });

  if (!link) return notFound();
  if (link.oneTime && link.consumedAt) return notFound();

  return (
    <section>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 max-w-xl mx-auto">
        <h1 className="text-xl font-semibold">
          Register for {link.package?.name ?? "Package"}
        </h1>
        <p className="text-sm text-white/60">
          Project: {link.project?.name ?? "-"}
        </p>

        <div className="mt-4">
          <Form token={link.token} />
        </div>
      </div>
    </section>
  );
}

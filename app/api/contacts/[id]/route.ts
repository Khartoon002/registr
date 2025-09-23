import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const d = await prisma.downline.findUnique({ where: { id: params.id } });
  if (!d) return new NextResponse("Not found", { status: 404 });

  const name = d.fullName || "Contact";
  const tel  = d.phone || "";
  const email= d.email || "";
  const vcf = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${name}`,
    `N:${name};;;;`,
    email ? `EMAIL;TYPE=INTERNET:${email}` : "",
    tel ? `TEL;TYPE=CELL:${tel}` : "",
    "END:VCARD"
  ].filter(Boolean).join("\r\n");

  return new NextResponse(vcf, {
    status: 200,
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name.replace(/\s+/g,'_')}.vcf"`
    }
  });
}

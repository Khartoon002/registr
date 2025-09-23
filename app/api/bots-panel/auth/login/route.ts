import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const { password } = await req.json();
  if (!process.env.BOTS_ADMIN_TOKEN) return new NextResponse("BOTS_ADMIN_TOKEN not set", { status: 500 });
  if (password !== process.env.BOTS_ADMIN_TOKEN) return new NextResponse("Invalid", { status: 401 });
  const res = new NextResponse("OK");
  res.cookies.set("bots_admin", process.env.BOTS_ADMIN_TOKEN, { httpOnly: true, path: "/", sameSite: "lax" });
  return res;
}
import { NextResponse } from "next/server";
export async function POST() {
  const res = new NextResponse("OK");
  res.cookies.set("bots_admin", "", { httpOnly: true, path: "/", expires: new Date(0) });
  return res;
}

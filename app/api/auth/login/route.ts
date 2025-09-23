import { NextRequest, NextResponse } from "next/server";

// ENV-first (fallbacks keep your current values working)
const ALLOWED_EMAIL     = (process.env.ADMIN_ALLOWED_EMAIL ?? "12coreclint@gmail.com").toLowerCase();
const ALLOWED_PASSWORD  = process.env.ADMIN_ALLOWED_PASSWORD ?? "#Clint4real";
const SESSION_COOKIE    = process.env.ADMIN_SESSION_COOKIE ?? "adminSession";
const MAX_AGE_SECS      = Number(process.env.ADMIN_SESSION_MAX_AGE ?? 60 * 60 * 24 * 7); // 7 days
const REQUIRE_EMAIL     = (process.env.ADMIN_REQUIRE_EMAIL ?? "false").toLowerCase() === "true";

// Parse JSON or form posts, tolerate different field names
async function readBody(req: NextRequest): Promise<Record<string, any>> {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try { return await req.json(); } catch { return {}; }
  }
  try {
    const fd = await req.formData();
    return Object.fromEntries(fd.entries());
  } catch {
    try { return await req.json(); } catch { return {}; }
  }
}

export async function POST(req: NextRequest) {
  const body = await readBody(req);

  const rawEmail = (body.email ?? body.username ?? "").toString().trim();
  const email    = rawEmail.toLowerCase();
  const password = (body.password ?? body.pass ?? "").toString().trim();

  if (!password) {
    return NextResponse.json({ ok: false, error: "Password is required" }, { status: 400 });
  }
  if (REQUIRE_EMAIL && !email) {
    return NextResponse.json({ ok: false, error: "Email is required" }, { status: 400 });
  }

  // Check password; email only if required (or provided)
  const passOK  = password === ALLOWED_PASSWORD;
  const emailOK = !REQUIRE_EMAIL
    ? (!rawEmail || email === ALLOWED_EMAIL) // allow password-only or matching email
    : (email === ALLOWED_EMAIL);

  if (!passOK || !emailOK) {
    return NextResponse.json({ ok: false, error: "Invalid email or password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECS,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
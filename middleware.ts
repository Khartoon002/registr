// middleware.ts
import { NextResponse, NextRequest } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

// keep this ONE source of truth for the cookie name
const SESSION_COOKIE = process.env.ADMIN_SESSION_COOKIE || "adminSession";

const PUBLIC_PREFIXES = [
  "/bots/",
  "/registrations",
  "/api/auth/login",
  "/api/auth/logout",
];

function isPublic(req: NextRequest) {
  const p = req.nextUrl.pathname;
  if (p.startsWith("/_next") || p.startsWith("/public") || PUBLIC_FILE.test(p)) return true;
  return PUBLIC_PREFIXES.some((pre) => p === pre || p.startsWith(pre + "/"));
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);

  // PUBLIC routes: allow
  if (isPublic(req)) return NextResponse.next();

  // Root login/logout are always public
  if (pathname === "/login" || pathname === "/logout") {
    // If already logged in and we hit /login, send user forward once
    if (pathname === "/login" && hasSession) {
      const url = req.nextUrl.clone();
      const next = req.nextUrl.searchParams.get("next") || "/dashboard";
      url.pathname = next;
      url.search = ""; // avoid ping-pong on the same URL
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // BOTS admin protection (token cookie)
  if (pathname.startsWith("/admin/bots")) {
    if (pathname.startsWith("/admin/bots/login") || pathname.startsWith("/admin/bots/logout")) {
      return NextResponse.next();
    }
    const token = req.cookies.get("bots_admin")?.value || "";
    const need = process.env.BOTS_ADMIN_TOKEN || "";
    if (!need || token !== need) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/bots/login";
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Everything else requires the session cookie
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};

import { NextResponse, NextRequest } from "next/server";
const PUBLIC_FILE = /\.(.*)$/;

const ROOT_LOGIN_PATH = "/login";
const ROOT_SESSION_COOKIES = ["adminSession"]; // <-- whatever your root cookie is
const BOTS_LOGIN_PATH = "/admin/bots/login";
const BOTS_COOKIE = "bots_admin";

function hasAnyCookie(req: NextRequest, names: string[]) {
  return names.some((n) => !!req.cookies.get(n)?.value);
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Skip static & API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/api") ||
    PUBLIC_FILE.test(pathname)
  ) return NextResponse.next();

  // ✅ PUBLIC: bots viewer should be open to everyone
  if (pathname === "/bots" || pathname.startsWith("/bots/")) {
    return NextResponse.next();
  }

  // 🔒 BOTS ADMIN: still protected
  if (pathname.startsWith("/admin/bots")) {
    if (pathname.startsWith(BOTS_LOGIN_PATH) || pathname.startsWith("/admin/bots/logout")) {
      return NextResponse.next();
    }
    const token = req.cookies.get(BOTS_COOKIE)?.value || "";
    const need  = process.env.BOTS_ADMIN_TOKEN || "";
    if (!need || token !== need) {
      const url = req.nextUrl.clone();
      url.pathname = BOTS_LOGIN_PATH;
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 🔓 Allow root login/logout pages
  if (pathname.startsWith(ROOT_LOGIN_PATH) || pathname === "/logout") {
    return NextResponse.next();
  }

  // 🔒 Everything else at root requires session
  if (!hasAnyCookie(req, ROOT_SESSION_COOKIES)) {
    const url = req.nextUrl.clone();
    url.pathname = ROOT_LOGIN_PATH;
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};

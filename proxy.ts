import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Optimistic checks only — reads the session refreshed by updateSession()
// from the cookie. Role-based authorization (admin/editor for /admin) is
// enforced separately in lib/auth/dal.ts against the database, since role
// isn't available here without a slow per-request DB call.
const PROTECTED_PREFIXES = ["/admin", "/profile", "/settings"];
const GUEST_ONLY_PATHS = ["/login", "/register", "/forgot-password"];

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const path = request.nextUrl.pathname;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
  if (isProtected && !user) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirectTo", path);
    return NextResponse.redirect(url);
  }

  if (GUEST_ONLY_PATHS.includes(path) && user) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - image file extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

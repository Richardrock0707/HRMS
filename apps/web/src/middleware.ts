import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route protection perimeter.
 *
 * Edge middleware cannot use Node's crypto, so it only checks that a session cookie
 * exists. The cookie is decrypted and verified (AES-256-GCM + expiry) on the server by
 * requireSession() in every server action and page. Never rely on this file alone.
 */
const COOKIE_NAME = "vsecure_session";
const PUBLIC_PATHS = ["/login", "/api/health"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  if (!request.cookies.get(COOKIE_NAME)?.value) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next.js internals and static files (images, fonts, etc.)
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|svg|gif|webp|ico|css|js)$).*)"],
};

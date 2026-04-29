import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware-client";

const PUBLIC_ROUTES = ["/", "/sign-in", "/auth/callback"];
const STATIC_PREFIXES = ["/_next", "/favicon", "/assets", "/api/health"];

function isPublic(pathname: string) {
  if (STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true;
  if (pathname.startsWith("/api/cron/")) return true;
  return PUBLIC_ROUTES.includes(pathname);
}

/**
 * Refresh the Supabase session on every request and gate authenticated routes.
 *
 * - Public marketing & auth pages: always allowed.
 * - Authenticated pages: require a session, otherwise redirect to /sign-in.
 *
 * Onboarding redirects (no business yet → /onboarding) are handled in the
 * authenticated layout, not here, to keep middleware fast and DB-free.
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  if (isPublic(req.nextUrl.pathname)) return res;

  const supabase = createSupabaseMiddlewareClient(req, res);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets).*)"]
};

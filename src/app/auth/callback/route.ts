import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { publicEnv } from "@/lib/utils/env";

/**
 * OAuth redirect target.
 *
 * Supabase redirects here with `?code=...` after the user finishes the
 * Google flow. We exchange the code for a session, then route to either
 * /onboarding (no business yet) or the requested page.
 *
 * Redirects are anchored to `publicEnv.siteUrl` rather than `request.url`.
 * Behind a reverse proxy (nginx) Next.js may resolve `request.url` against
 * the bound interface (e.g. http://localhost:3000) instead of the public
 * host, which would send authenticated users to a dead address.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedRedirect = url.searchParams.get("redirect") ?? "/dashboard";

  const redirectTo = (path: string) =>
    NextResponse.redirect(new URL(path, publicEnv.siteUrl));

  if (!code) return redirectTo("/sign-in");

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return redirectTo("/sign-in?error=oauth");

  const { data: businessRows } = await supabase
    .from("businesses")
    .select("id")
    .limit(1);

  const hasBusiness = (businessRows?.length ?? 0) > 0;
  return redirectTo(hasBusiness ? requestedRedirect : "/onboarding");
}

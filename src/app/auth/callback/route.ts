import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

/**
 * OAuth redirect target.
 *
 * Supabase redirects here with `?code=...` after the user finishes the
 * Google flow. We exchange the code for a session, then route to either
 * /onboarding (no business yet) or the requested page.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedRedirect = url.searchParams.get("redirect") ?? "/dashboard";

  if (!code) return NextResponse.redirect(new URL("/sign-in", request.url));

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/sign-in?error=oauth", request.url));

  const { data: businessRows } = await supabase
    .from("businesses")
    .select("id")
    .limit(1);

  const hasBusiness = (businessRows?.length ?? 0) > 0;
  const target = hasBusiness ? requestedRedirect : "/onboarding";
  return NextResponse.redirect(new URL(target, request.url));
}

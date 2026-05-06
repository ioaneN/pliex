import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { publicEnv } from "@/lib/utils/env";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { getOwnedBusiness } from "@/lib/services/businesses";
import { buildSquareAuthorizeUrl, createSquareOAuthState } from "@/lib/integrations/square/oauth";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/sign-in", publicEnv.siteUrl));

  const business = await getOwnedBusiness();
  if (!business) return NextResponse.redirect(new URL("/onboarding", publicEnv.siteUrl));

  try {
    const state = createSquareOAuthState({ businessId: business.id, userId: user.id });
    cookies().set("square_oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 10 * 60
    });
    return NextResponse.redirect(buildSquareAuthorizeUrl(state));
  } catch (error) {
    console.error("[square/oauth/start]", error);
    return NextResponse.redirect(new URL("/integrations/square?error=oauth_config", publicEnv.siteUrl));
  }
}

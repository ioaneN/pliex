import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { publicEnv, serverEnv } from "@/lib/utils/env";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { getOwnedBusiness } from "@/lib/services/businesses";
import { fetchSquareLocations } from "@/lib/integrations/square/client";
import { exchangeSquareAuthorizationCode, verifySquareOAuthState } from "@/lib/integrations/square/oauth";
import { syncSquareForBusiness, upsertSquareOAuthConnection } from "@/lib/services/square";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const redirectUrl = new URL("/integrations/square", publicEnv.siteUrl);

  if (error) {
    redirectUrl.searchParams.set("error", error);
    return NextResponse.redirect(redirectUrl);
  }
  if (!code || !state) {
    redirectUrl.searchParams.set("error", "missing_oauth_code");
    return NextResponse.redirect(redirectUrl);
  }

  const cookieState = cookies().get("square_oauth_state")?.value;
  if (!cookieState || cookieState !== state) {
    redirectUrl.searchParams.set("error", "invalid_oauth_state");
    return NextResponse.redirect(redirectUrl);
  }

  const user = await getCurrentUser();
  const business = await getOwnedBusiness();
  if (!user || !business) {
    redirectUrl.pathname = "/sign-in";
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const payload = verifySquareOAuthState(state);
    if (payload.userId !== user.id || payload.businessId !== business.id) {
      throw new Error("OAuth state does not match signed-in user.");
    }

    const token = await exchangeSquareAuthorizationCode(code);
    const locations = await fetchSquareLocations({
      accessToken: token.access_token,
      environment: serverEnv.squareEnvironment
    });
    if (!locations.ok) {
      throw new Error(locations.error ?? "Could not load Square locations.");
    }

    await upsertSquareOAuthConnection({
      businessId: business.id,
      accessToken: token.access_token,
      refreshToken: token.refresh_token ?? null,
      accessTokenExpiresAt: token.expires_at ?? null,
      merchantId: token.merchant_id ?? null,
      locationId: locations.locations[0]?.id ?? null,
      environment: serverEnv.squareEnvironment,
      scope: token.scope ?? null
    });

    await syncSquareForBusiness(business.id);
    cookies().delete("square_oauth_state");
    redirectUrl.searchParams.set("connected", "1");
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error("[square/oauth/callback]", err);
    redirectUrl.searchParams.set("error", "oauth_failed");
    return NextResponse.redirect(redirectUrl);
  }
}

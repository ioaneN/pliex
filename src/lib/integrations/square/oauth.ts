import "server-only";
import crypto from "crypto";
import { publicEnv, serverEnv } from "@/lib/utils/env";
import { squareApiBaseUrl, type SquareEnvironment } from "@/lib/integrations/square/client";

const STATE_TTL_MS = 10 * 60 * 1000;

export interface SquareOAuthState {
  businessId: string;
  userId: string;
  nonce: string;
  expiresAt: number;
}

export interface SquareTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  merchant_id?: string;
  scope?: string;
}

function appSecret(): string {
  if (!serverEnv.squareApplicationSecret) {
    throw new Error("SQUARE_APPLICATION_SECRET is not configured.");
  }
  return serverEnv.squareApplicationSecret;
}

function oauthBaseUrl(environment: SquareEnvironment): string {
  return environment === "sandbox"
    ? "https://connect.squareupsandbox.com"
    : "https://connect.squareup.com";
}

export function createSquareOAuthState(input: { businessId: string; userId: string }): string {
  const payload: SquareOAuthState = {
    businessId: input.businessId,
    userId: input.userId,
    nonce: crypto.randomBytes(16).toString("base64url"),
    expiresAt: Date.now() + STATE_TTL_MS
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", appSecret()).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifySquareOAuthState(value: string): SquareOAuthState {
  const [encoded, sig] = value.split(".");
  if (!encoded || !sig) throw new Error("Invalid OAuth state.");
  const expected = crypto.createHmac("sha256", appSecret()).update(encoded).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    throw new Error("Invalid OAuth state signature.");
  }
  const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SquareOAuthState;
  if (payload.expiresAt < Date.now()) throw new Error("OAuth state expired.");
  return payload;
}

export function buildSquareAuthorizeUrl(state: string): string {
  if (!serverEnv.squareApplicationId) {
    throw new Error("SQUARE_APPLICATION_ID is not configured.");
  }
  const url = new URL(`${oauthBaseUrl(serverEnv.squareEnvironment)}/oauth2/authorize`);
  url.searchParams.set("client_id", serverEnv.squareApplicationId);
  url.searchParams.set("scope", "MERCHANT_PROFILE_READ PAYMENTS_READ ORDERS_READ");
  url.searchParams.set("session", "false");
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeSquareAuthorizationCode(code: string): Promise<SquareTokenResponse> {
  return requestSquareToken({
    grant_type: "authorization_code",
    code,
    redirect_uri: `${publicEnv.siteUrl}/api/integrations/square/oauth/callback`
  });
}

export async function refreshSquareAccessToken(refreshToken: string): Promise<SquareTokenResponse> {
  return requestSquareToken({
    grant_type: "refresh_token",
    refresh_token: refreshToken
  });
}

export async function revokeSquareAccessToken(accessToken: string): Promise<void> {
  if (!serverEnv.squareApplicationId) return;
  await fetch(`${squareApiBaseUrl(serverEnv.squareEnvironment)}/oauth2/revoke`, {
    method: "POST",
    headers: {
      Authorization: `Client ${appSecret()}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      client_id: serverEnv.squareApplicationId,
      access_token: accessToken
    })
  }).catch(() => undefined);
}

async function requestSquareToken(body: Record<string, string>): Promise<SquareTokenResponse> {
  if (!serverEnv.squareApplicationId) {
    throw new Error("SQUARE_APPLICATION_ID is not configured.");
  }

  const res = await fetch(`${squareApiBaseUrl(serverEnv.squareEnvironment)}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      client_id: serverEnv.squareApplicationId,
      client_secret: appSecret(),
      ...body
    }),
    cache: "no-store",
    next: { revalidate: 0 }
  });

  const data = (await res.json().catch(() => ({}))) as SquareTokenResponse & {
    errors?: Array<{ detail?: string }>;
  };
  if (!res.ok) {
    const message = data.errors?.map((e) => e.detail).filter(Boolean).join("; ") || `Square OAuth failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

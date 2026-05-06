import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { listSquarePayments } from "@/lib/integrations/square/client";
import { refreshSquareAccessToken, revokeSquareAccessToken } from "@/lib/integrations/square/oauth";
import { parseSquarePaymentsToSales } from "@/lib/integrations/square/payments-to-sales";
import { decryptSecret, encryptSecret } from "@/lib/security/secrets";
import type { SafeSquareConnection, SquareConnectionRow } from "@/types/database";

const SALES_UPSERT_CHUNK = 75;
const REFRESH_SKEW_MS = 5 * 60 * 1000;

export async function getSquareConnection(businessId: string): Promise<SquareConnectionRow | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("square_connections")
    .select("*")
    .eq("business_id", businessId)
    .maybeSingle();

  if (error) throw error;
  return data as SquareConnectionRow | null;
}

export async function getSquareConnectionSafe(businessId: string): Promise<SafeSquareConnection | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("square_connections")
    .select(
      "id,business_id,merchant_id,location_id,environment,scope,connected_at,disconnected_at,last_sync_at,last_sync_status,last_error,created_at,updated_at"
    )
    .eq("business_id", businessId)
    .maybeSingle();

  if (error) throw error;
  return data as SafeSquareConnection | null;
}

export async function upsertSquareOAuthConnection(input: {
  businessId: string;
  accessToken: string;
  refreshToken?: string | null;
  accessTokenExpiresAt?: string | null;
  merchantId?: string | null;
  locationId: string | null;
  environment: "production" | "sandbox";
  scope?: string | null;
}): Promise<SquareConnectionRow> {
  const supabase = createSupabaseServerClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("square_connections")
    .upsert(
      {
        business_id: input.businessId,
        access_token: encryptSecret(input.accessToken.trim()),
        refresh_token: input.refreshToken ? encryptSecret(input.refreshToken.trim()) : null,
        access_token_expires_at: input.accessTokenExpiresAt ?? null,
        merchant_id: input.merchantId ?? null,
        location_id: input.locationId?.trim() || null,
        environment: input.environment,
        scope: input.scope ?? null,
        connected_at: now,
        disconnected_at: null,
        updated_at: now
      },
      { onConflict: "business_id" }
    )
    .select("*")
    .single();

  if (error) throw error;
  return data as SquareConnectionRow;
}

export async function disconnectSquareConnection(businessId: string): Promise<void> {
  const supabase = createSupabaseServerClient();
  const conn = await getSquareConnection(businessId);
  if (conn?.access_token) {
    await revokeSquareAccessToken(decryptSecret(conn.access_token));
  }
  const { error } = await supabase
    .from("square_connections")
    .update({
      access_token: null,
      refresh_token: null,
      access_token_expires_at: null,
      disconnected_at: new Date().toISOString(),
      last_sync_status: null,
      last_error: null
    })
    .eq("business_id", businessId);
  if (error) throw error;
}

export async function applySquarePaymentsToSales(
  supabase: SupabaseClient,
  businessId: string,
  payments: Awaited<ReturnType<typeof listSquarePayments>>["payments"]
): Promise<{ applied: number; error?: string }> {
  const parsed = parseSquarePaymentsToSales(payments);
  if (parsed.length === 0) return { applied: 0 };

  const rows = parsed.map((r) => ({
    business_id: businessId,
    external_key: r.external_key,
    amount: r.amount,
    sale_date: r.sale_date,
    category: r.category,
    notes: r.notes,
    source: "integration" as const
  }));

  let applied = 0;
  for (let i = 0; i < rows.length; i += SALES_UPSERT_CHUNK) {
    const chunk = rows.slice(i, i + SALES_UPSERT_CHUNK);
    const { error } = await supabase.from("sales").upsert(chunk, {
      onConflict: "business_id,external_key"
    });
    if (error) return { applied, error: error.message };
    applied += chunk.length;
  }

  return { applied };
}

export async function syncSquareForBusiness(
  businessId: string,
  client?: SupabaseClient
): Promise<{ ok: boolean; error?: string; salesApplied: number; fetchedPayments: number }> {
  const supabase = client ?? createSupabaseServerClient();
  const { data: conn, error: connErr } = await supabase
    .from("square_connections")
    .select("*")
    .eq("business_id", businessId)
    .maybeSingle();

  if (connErr) return { ok: false, error: connErr.message, salesApplied: 0, fetchedPayments: 0 };
  if (!conn) return { ok: false, error: "No Square connection configured.", salesApplied: 0, fetchedPayments: 0 };

  const row = conn as SquareConnectionRow;
  if (!row.access_token || row.disconnected_at) {
    return { ok: false, error: "Square is not connected.", salesApplied: 0, fetchedPayments: 0 };
  }
  const beginTime = row.last_sync_at
    ? new Date(new Date(row.last_sync_at).getTime() - 86_400_000).toISOString()
    : new Date(Date.now() - 30 * 86_400_000).toISOString();

  try {
    const token = await getFreshSquareAccessToken(row, supabase);
    const payments = await listSquarePayments({
      accessToken: token,
      environment: row.environment,
      locationId: row.location_id,
      beginTime
    });
    if (!payments.ok && payments.status === 401 && row.refresh_token) {
      const refreshed = await refreshAndPersistSquareToken(row, supabase);
      const retry = await listSquarePayments({
        accessToken: refreshed,
        environment: row.environment,
        locationId: row.location_id,
        beginTime
      });
      if (retry.ok) {
        return applySquareSyncResult(supabase, businessId, retry.payments);
      }
    }
    if (!payments.ok) {
      await supabase
        .from("square_connections")
        .update({
          last_sync_at: new Date().toISOString(),
          last_sync_status: "error",
          last_error: payments.error ?? "Square sync failed"
        })
        .eq("business_id", businessId);
      return { ok: false, error: payments.error ?? "Square sync failed", salesApplied: 0, fetchedPayments: 0 };
    }

    return applySquareSyncResult(supabase, businessId, payments.payments);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Square sync failed";
    await supabase
      .from("square_connections")
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: "error",
        last_error: message
      })
      .eq("business_id", businessId);
    return { ok: false, error: message, salesApplied: 0, fetchedPayments: 0 };
  }
}

export async function syncAllSquareConnections(): Promise<{ synced: number; errors: string[] }> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { synced: 0, errors: ["SUPABASE_SERVICE_ROLE_KEY not configured"] };

  const { data, error } = await admin
    .from("square_connections")
    .select("business_id")
    .is("disconnected_at", null);
  if (error) return { synced: 0, errors: [error.message] };

  const errors: string[] = [];
  let synced = 0;
  for (const row of data ?? []) {
    const businessId = (row as { business_id: string }).business_id;
    const result = await syncSquareForBusiness(businessId, admin);
    if (result.ok) synced++;
    else errors.push(`${businessId}: ${result.error ?? "sync failed"}`);
  }
  return { synced, errors };
}

async function applySquareSyncResult(
  supabase: SupabaseClient,
  businessId: string,
  payments: Awaited<ReturnType<typeof listSquarePayments>>["payments"]
): Promise<{ ok: boolean; error?: string; salesApplied: number; fetchedPayments: number }> {
  const ledger = await applySquarePaymentsToSales(supabase, businessId, payments);
  if (ledger.error) {
    await supabase
      .from("square_connections")
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: "error",
        last_error: ledger.error
      })
      .eq("business_id", businessId);
    return {
      ok: false,
      error: ledger.error,
      salesApplied: ledger.applied,
      fetchedPayments: payments.length
    };
  }

  await supabase
    .from("square_connections")
    .update({
      last_sync_at: new Date().toISOString(),
      last_sync_status: "ok",
      last_error: null
    })
    .eq("business_id", businessId);

  return {
    ok: true,
    salesApplied: ledger.applied,
    fetchedPayments: payments.length
  };
}

async function getFreshSquareAccessToken(row: SquareConnectionRow, supabase: SupabaseClient): Promise<string> {
  const expiresAt = row.access_token_expires_at ? new Date(row.access_token_expires_at).getTime() : 0;
  if (row.refresh_token && expiresAt > 0 && expiresAt - Date.now() < REFRESH_SKEW_MS) {
    return refreshAndPersistSquareToken(row, supabase);
  }
  if (!row.access_token) throw new Error("Square access token missing.");
  return decryptSecret(row.access_token);
}

async function refreshAndPersistSquareToken(row: SquareConnectionRow, supabase: SupabaseClient): Promise<string> {
  if (!row.refresh_token) throw new Error("Square refresh token missing.");
  const token = await refreshSquareAccessToken(decryptSecret(row.refresh_token));
  const accessToken = token.access_token;
  const { error } = await supabase
    .from("square_connections")
    .update({
      access_token: encryptSecret(accessToken),
      refresh_token: token.refresh_token ? encryptSecret(token.refresh_token) : row.refresh_token,
      access_token_expires_at: token.expires_at ?? row.access_token_expires_at,
      merchant_id: token.merchant_id ?? row.merchant_id,
      scope: token.scope ?? row.scope,
      updated_at: new Date().toISOString()
    })
    .eq("business_id", row.business_id);
  if (error) throw error;
  return accessToken;
}

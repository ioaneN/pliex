import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { buildGizmoSyncPayload } from "@/lib/integrations/gizmo/normalize";
import { parseGizmoInvoicesFromBody } from "@/lib/integrations/gizmo/invoice-to-sales";
import { fetchGizmoEndpoints } from "@/lib/integrations/gizmo/client";
import type { GizmoConnectionRow, GizmoSyncPayload, GizmoNormalizedMetrics } from "@/types/database";

export async function getGizmoConnection(businessId: string): Promise<GizmoConnectionRow | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("gizmo_connections")
    .select("*")
    .eq("business_id", businessId)
    .maybeSingle();

  if (error) throw error;
  return data as GizmoConnectionRow | null;
}

export async function upsertGizmoConnection(input: {
  businessId: string;
  baseUrl: string;
  apiUsername: string;
  apiPassword: string;
}): Promise<GizmoConnectionRow> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("gizmo_connections")
    .upsert(
      {
        business_id: input.businessId,
        base_url: input.baseUrl.replace(/\/+$/, ""),
        api_username: input.apiUsername,
        api_password: input.apiPassword,
        updated_at: new Date().toISOString()
      },
      { onConflict: "business_id" }
    )
    .select("*")
    .single();

  if (error) throw error;
  return data as GizmoConnectionRow;
}

export async function getLatestGizmoNormalized(
  businessId: string
): Promise<GizmoNormalizedMetrics | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("gizmo_sync_snapshots")
    .select("payload")
    .eq("business_id", businessId)
    .order("captured_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data?.payload || typeof data.payload !== "object") return null;
  const payload = data.payload as GizmoSyncPayload;
  if (!payload.normalized || typeof payload.normalized !== "object") return null;
  return payload.normalized;
}

const SALES_UPSERT_CHUNK = 75;

/**
 * Upserts Gizmo invoice lines into `sales` so dashboard / AI use one ledger.
 * Re-sync updates amounts/dates for the same `external_key`.
 */
export async function applyGizmoInvoicesToSales(
  supabase: SupabaseClient,
  businessId: string,
  invoiceBody: unknown
): Promise<{ applied: number; error?: string }> {
  const parsed = parseGizmoInvoicesFromBody(invoiceBody);
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

export async function syncGizmoForBusiness(
  businessId: string,
  client?: SupabaseClient
): Promise<{
  ok: boolean;
  payload?: GizmoSyncPayload;
  error?: string;
  /** Rows upserted into `sales` from Gizmo invoices this run (0 if invoice API not OK or none parsed). */
  salesApplied?: number;
}> {
  const supabase = client ?? createSupabaseServerClient();

  const { data: conn, error: connErr } = await supabase
    .from("gizmo_connections")
    .select("*")
    .eq("business_id", businessId)
    .maybeSingle();

  if (connErr) return { ok: false, error: connErr.message };
  if (!conn) return { ok: false, error: "No Gizmo connection configured." };

  const row = conn as GizmoConnectionRow;

  try {
    const raw = await fetchGizmoEndpoints({
      baseUrl: row.base_url,
      apiUsername: row.api_username,
      apiPassword: row.api_password
    });
    const payload = buildGizmoSyncPayload(raw);

    const { error: snapErr } = await supabase.from("gizmo_sync_snapshots").insert({
      business_id: businessId,
      payload
    });
    if (snapErr) return { ok: false, error: snapErr.message };

    let salesApplied = 0;
    const invoiceOk = raw.invoice && raw.invoice.status >= 200 && raw.invoice.status < 300;
    if (invoiceOk) {
      const ledger = await applyGizmoInvoicesToSales(supabase, businessId, raw.invoice.body);
      if (ledger.error) {
        await supabase
          .from("gizmo_connections")
          .update({
            last_sync_at: new Date().toISOString(),
            last_sync_status: "error",
            last_error: `Snapshot saved; sales import failed: ${ledger.error}`
          })
          .eq("business_id", businessId);
        return { ok: false, error: ledger.error, payload, salesApplied: ledger.applied };
      }
      salesApplied = ledger.applied;
    }

    const authFail = Object.values(raw).some((v) => v.status === 401 || v.status === 403);
    const anyOk = Object.values(raw).some((v) => v.status >= 200 && v.status < 300);
    const allNetworkFail = Object.values(raw).every((v) => v.status === 0);
    const status = authFail || !anyOk ? "error" : "ok";
    const lastError =
      status === "error"
        ? authFail
          ? "Authentication failed."
          : allNetworkFail
            ? "Could not reach Gizmo Web API. Check URL and tunnel."
            : payload.errors.filter(Boolean).join("; ") || "No successful API response."
        : null;

    await supabase
      .from("gizmo_connections")
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: status,
        last_error: lastError
      })
      .eq("business_id", businessId);

    return { ok: status === "ok", payload, salesApplied };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Sync failed";
    await supabase
      .from("gizmo_connections")
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: "error",
        last_error: msg
      })
      .eq("business_id", businessId);
    return { ok: false, error: msg };
  }
}

/** Cron: sync all businesses that have a Gizmo connection (service role). */
export async function syncAllGizmoConnections(): Promise<{ synced: number; errors: string[] }> {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return { synced: 0, errors: ["SUPABASE_SERVICE_ROLE_KEY not configured"] };
  }

  const { data: rows, error } = await admin.from("gizmo_connections").select("business_id");
  if (error) return { synced: 0, errors: [error.message] };
  const errors: string[] = [];
  let synced = 0;
  for (const r of rows ?? []) {
    const bid = (r as { business_id: string }).business_id;
    const result = await syncGizmoForBusiness(bid, admin);
    if (result.ok) synced++;
    else if (result.error) errors.push(`${bid}: ${result.error}`);
  }
  return { synced, errors };
}

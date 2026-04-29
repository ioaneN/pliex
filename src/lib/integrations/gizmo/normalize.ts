import type { GizmoNormalizedMetrics, GizmoSyncPayload } from "@/types/database";

function asArray(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    const inner = o.data ?? o.Data ?? o.items ?? o.Items ?? o.result ?? o.Result;
    if (Array.isArray(inner)) return inner;
  }
  return [];
}

function hostsMetrics(hostBody: unknown): { total: number; inUse: number } {
  const list = asArray(hostBody);
  let inUse = 0;
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const h = item as Record<string, unknown>;
    const user =
      h.User ?? h.user ?? h.CurrentUser ?? h.Username ?? h.username ?? h.LoggedInUser;
    const session = h.Session ?? h.session ?? h.UsageSession;
    const state = String(h.State ?? h.Status ?? h.HostState ?? "").toLowerCase();
    const busy =
      (typeof user === "string" && user.trim().length > 0) ||
      (typeof session === "string" && session.trim().length > 0) ||
      state.includes("in use") ||
      state.includes("busy") ||
      state === "occupied";
    if (busy) inUse++;
  }
  return { total: list.length, inUse };
}

function invoiceMetrics(invoiceBody: unknown): { count: number; revenue: number } {
  const list = asArray(invoiceBody);
  let revenue = 0;
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const inv = item as Record<string, unknown>;
    const total =
      num(inv.Total) ??
      num(inv.total) ??
      num(inv.Amount) ??
      num(inv.Value) ??
      num(inv.InvoiceTotal);
    if (total != null) revenue += total;
  }
  return { count: list.length, revenue: Math.round(revenue * 100) / 100 };
}

function num(v: unknown): number | null {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

function lowStockCount(productBody: unknown): number {
  const list = asArray(productBody);
  let low = 0;
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const p = item as Record<string, unknown>;
    const qty =
      num(p.Quantity ?? p.quantity ?? p.Stock ?? p.stock ?? p.CurrentStock) ?? 0;
    const threshold =
      num(p.ReorderThreshold ?? p.reorderThreshold ?? p.MinStock ?? p.minStock) ?? 0;
    if (threshold > 0 && qty <= threshold) low++;
  }
  return low;
}

export function buildGizmoSyncPayload(
  raw: Record<string, { status: number; body: unknown }>
): GizmoSyncPayload {
  const errors: string[] = [];
  for (const [k, v] of Object.entries(raw)) {
    if (v.status === 0) errors.push(`${k}: network error`);
    else if (v.status === 401 || v.status === 403) errors.push(`${k}: unauthorized`);
    else if (v.status >= 400) errors.push(`${k}: HTTP ${v.status}`);
  }

  const hostBody = raw.host?.body;
  const invBody = raw.invoice?.body;
  const prodBody = raw.product?.body;

  const { total: hostsTotal, inUse: hostsInUse } = hostsMetrics(hostBody);
  const { count: invoiceCount, revenue: invoiceRevenueApprox } = invoiceMetrics(invBody);
  const lowStockProductCount = lowStockCount(prodBody);

  const normalized: GizmoNormalizedMetrics = {
    hostsTotal,
    hostsInUse,
    invoiceCount,
    invoiceRevenueApprox,
    lowStockProductCount
  };

  return {
    normalized,
    raw,
    errors,
    fetchedAt: new Date().toISOString()
  };
}

import "server-only";

/** One row to upsert into `public.sales` from a Gizmo invoice payload. */
export interface ParsedGizmoSale {
  external_key: string;
  amount: number;
  sale_date: string;
  category: string;
  notes: string | null;
}

function asArray(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    const inner = o.data ?? o.Data ?? o.items ?? o.Items ?? o.result ?? o.Result;
    if (Array.isArray(inner)) return inner;
  }
  return [];
}

function num(v: unknown): number | null {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

function invoiceId(inv: Record<string, unknown>): string | null {
  const v = inv.Id ?? inv.id ?? inv.InvoiceId ?? inv.invoiceId ?? inv.InvoiceNumber ?? inv.Number;
  if (v == null || v === "") return null;
  return String(v);
}

function isVoided(inv: Record<string, unknown>): boolean {
  const voidTime = inv.VoidTime ?? inv.voidTime ?? inv.VoidedAt ?? inv.voidedAt;
  if (voidTime != null && String(voidTime).trim() !== "") return true;
  const st = String(inv.Status ?? inv.InvoiceStatus ?? inv.state ?? inv.InvoiceState ?? "").toLowerCase();
  if (st.includes("void")) return true;
  if (st === "canceled" || st === "cancelled") return true;
  return false;
}

/** Parse API date-ish values to `YYYY-MM-DD` (UTC date for ISO strings). */
function toSaleDateIso(inv: Record<string, unknown>): string | null {
  const raw =
    inv.CreationTime ??
    inv.Created ??
    inv.creationTime ??
    inv.Date ??
    inv.InvoiceDate ??
    inv.date ??
    inv.CreatedAt;
  if (raw == null) return null;
  if (typeof raw === "string") {
    const s = raw.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  if (typeof raw === "number") {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return null;
}

function invoiceTotal(inv: Record<string, unknown>): number | null {
  const outstanding = num(inv.Outstanding ?? inv.outstanding);
  const total =
    num(inv.Total) ??
    num(inv.total) ??
    num(inv.Amount) ??
    num(inv.Value) ??
    num(inv.InvoiceTotal) ??
    num(inv.PaidTotal) ??
    num(inv.paidTotal);
  if (total != null && total >= 0) return total;
  if (outstanding != null && outstanding >= 0) return outstanding;
  return null;
}

/**
 * Turn Gizmo `/api/invoice` JSON into ledger rows. Skips voided/cancelled and
 * rows without a stable id or positive amount.
 */
export function parseGizmoInvoicesFromBody(body: unknown): ParsedGizmoSale[] {
  const list = asArray(body);
  const out: ParsedGizmoSale[] = [];
  const seen = new Set<string>();

  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const inv = item as Record<string, unknown>;
    if (isVoided(inv)) continue;

    const id = invoiceId(inv);
    if (!id) continue;

    const external_key = `gizmo:invoice:${id}`;
    if (seen.has(external_key)) continue;
    seen.add(external_key);

    const amount = invoiceTotal(inv);
    if (amount == null || amount <= 0) continue;

    const sale_date = toSaleDateIso(inv) ?? new Date().toISOString().slice(0, 10);

    const host = inv.Host ?? inv.host;
    const hostNote = host != null && String(host).trim() !== "" ? `Host: ${String(host)}` : null;

    out.push({
      external_key,
      amount: Math.round(amount * 100) / 100,
      sale_date,
      category: "POS (Gizmo)",
      notes: hostNote
    });
  }

  return out;
}

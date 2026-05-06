import type { SquarePayment } from "@/lib/integrations/square/client";

/** One row to upsert into `public.sales` from a Square payment payload. */
export interface ParsedSquareSale {
  external_key: string;
  amount: number;
  sale_date: string;
  category: string;
  notes: string | null;
}

function centsToCurrency(amount?: number): number | null {
  if (typeof amount !== "number" || Number.isNaN(amount)) return null;
  return Math.round(amount) / 100;
}

function toSaleDateIso(createdAt?: string): string | null {
  if (!createdAt) return null;
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export function parseSquarePaymentsToSales(payments: SquarePayment[]): ParsedSquareSale[] {
  const out: ParsedSquareSale[] = [];
  const seen = new Set<string>();

  for (const p of payments) {
    if (!p?.id) continue;
    if (p.status && p.status !== "COMPLETED") continue;

    const external_key = `square:payment:${p.id}`;
    if (seen.has(external_key)) continue;
    seen.add(external_key);

    const amount = centsToCurrency(p.amount_money?.amount);
    if (amount == null || amount <= 0) continue;

    const sale_date = toSaleDateIso(p.created_at) ?? new Date().toISOString().slice(0, 10);

    const noteParts = [p.note, p.order_id ? `Order: ${p.order_id}` : null].filter(Boolean);
    out.push({
      external_key,
      amount,
      sale_date,
      category: "POS (Square)",
      notes: noteParts.length > 0 ? noteParts.join(" | ") : null
    });
  }

  return out;
}

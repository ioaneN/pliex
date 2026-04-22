import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { daysAgo, today } from "@/lib/utils/dates";
import type { SaleRow } from "@/types/database";

export interface CreateSaleInput {
  businessId: string;
  amount: number;
  category?: string;
  saleDate?: string;
  notes?: string;
}

export async function createSale(input: CreateSaleInput): Promise<SaleRow> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("sales")
    .insert({
      business_id: input.businessId,
      amount: input.amount,
      category: input.category ?? null,
      sale_date: input.saleDate ?? today(),
      notes: input.notes ?? null,
      source: "manual"
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function listRecentSales(businessId: string, limit = 50): Promise<SaleRow[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("business_id", businessId)
    .order("sale_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function listSalesInWindow(
  businessId: string,
  fromInclusive: string,
  toInclusive: string
): Promise<SaleRow[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("business_id", businessId)
    .gte("sale_date", fromInclusive)
    .lte("sale_date", toInclusive);

  if (error) throw error;
  return data ?? [];
}

export async function listSalesLastNDays(businessId: string, n: number): Promise<SaleRow[]> {
  return listSalesInWindow(businessId, daysAgo(n - 1), today());
}

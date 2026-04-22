import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { daysAgo, today } from "@/lib/utils/dates";
import type { ExpenseRow } from "@/types/database";

export interface CreateExpenseInput {
  businessId: string;
  amount: number;
  category?: string;
  expenseDate?: string;
  vendorName?: string;
  notes?: string;
}

export async function createExpense(input: CreateExpenseInput): Promise<ExpenseRow> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      business_id: input.businessId,
      amount: input.amount,
      category: input.category ?? null,
      expense_date: input.expenseDate ?? today(),
      vendor_name: input.vendorName ?? null,
      notes: input.notes ?? null,
      source: "manual"
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function listRecentExpenses(businessId: string, limit = 50): Promise<ExpenseRow[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("business_id", businessId)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function listExpensesLastNDays(businessId: string, n: number): Promise<ExpenseRow[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("business_id", businessId)
    .gte("expense_date", daysAgo(n - 1))
    .lte("expense_date", today());

  if (error) throw error;
  return data ?? [];
}

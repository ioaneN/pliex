import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { InventoryItemRow } from "@/types/database";

export async function listInventory(businessId: string): Promise<InventoryItemRow[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("business_id", businessId)
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export function selectLowStock(items: InventoryItemRow[]): InventoryItemRow[] {
  return items.filter((i) => i.quantity <= i.reorder_threshold);
}

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { AutomationRow } from "@/types/database";

export async function listAutomations(businessId: string): Promise<AutomationRow[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("automations")
    .select("*")
    .eq("business_id", businessId)
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function setAutomationEnabled(automationId: string, isEnabled: boolean): Promise<void> {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("automations")
    .update({ is_enabled: isEnabled })
    .eq("id", automationId);

  if (error) throw error;
}

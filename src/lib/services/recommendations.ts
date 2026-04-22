import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { RecommendationRow } from "@/types/database";

export async function listOpenRecommendations(businessId: string): Promise<RecommendationRow[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("recommendations")
    .select("*")
    .eq("business_id", businessId)
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

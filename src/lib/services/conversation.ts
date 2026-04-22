import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { AiConversationRow, ConversationRole } from "@/types/database";

export async function listRecentConversation(
  businessId: string,
  limit = 20
): Promise<AiConversationRow[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ai_conversations")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function appendMessage(
  businessId: string,
  userId: string,
  role: ConversationRole,
  message: string
): Promise<AiConversationRow> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ai_conversations")
    .insert({ business_id: businessId, user_id: userId, role, message })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

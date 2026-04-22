import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { User } from "@supabase/supabase-js";

/**
 * Returns the authenticated Supabase user for the current request, or null.
 * Centralizes the call so every page/handler treats "no session" identically.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user ?? null;
}

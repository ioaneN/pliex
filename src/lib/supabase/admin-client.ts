import "server-only";
import { createClient } from "@supabase/supabase-js";
import { publicEnv, serverEnv } from "@/lib/utils/env";

/** Service-role client for cron / admin jobs. Returns null if key not configured. */
export function createSupabaseAdminClient() {
  const key = serverEnv.supabaseServiceRoleKey;
  if (!key) return null;
  return createClient(publicEnv.supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

"use client";

import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/utils/env";

/**
 * Supabase client for use inside React Client Components.
 * Reads/writes the auth cookie via the browser session storage.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey);
}

/**
 * Strongly-typed access to environment variables.
 * Failing fast at boot time is preferred over silent undefined behavior.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(value: string | undefined, fallback: string): string {
  return value && value.trim() !== "" ? value : fallback;
}

export const publicEnv = {
  siteUrl: optional(process.env.NEXT_PUBLIC_SITE_URL, "http://localhost:3000"),
  supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: required(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
};

/** Server-only env, never imported from a "use client" module. */
export const serverEnv = {
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  openAiModel: optional(process.env.OPENAI_MODEL, "gpt-4o-mini"),
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  resendFromEmail: optional(process.env.RESEND_FROM_EMAIL, "Pliex <noreply@pliex.app>"),
  /** Optional: authorize `/api/cron/gizmo-sync` (e.g. Vercel Cron `CRON_SECRET`). */
  cronSecret: process.env.CRON_SECRET ?? ""
};

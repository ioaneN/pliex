import "server-only";
import { Resend } from "resend";
import { serverEnv } from "@/lib/utils/env";

let cached: Resend | null = null;

export function getResendClient(): Resend | null {
  if (!serverEnv.resendApiKey) return null;
  if (!cached) cached = new Resend(serverEnv.resendApiKey);
  return cached;
}

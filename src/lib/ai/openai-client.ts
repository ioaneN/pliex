import "server-only";
import OpenAI from "openai";
import { serverEnv } from "@/lib/utils/env";

let cached: OpenAI | null = null;

/**
 * Returns a singleton OpenAI client, or null if no API key is configured.
 * The assistant route handler must gracefully degrade when this is null.
 */
export function getOpenAiClient(): OpenAI | null {
  if (!serverEnv.openAiApiKey) return null;
  if (!cached) cached = new OpenAI({ apiKey: serverEnv.openAiApiKey });
  return cached;
}

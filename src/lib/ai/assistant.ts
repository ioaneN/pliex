import "server-only";
import { getOpenAiClient } from "@/lib/ai/openai-client";
import { logOpenAiSdkError, mapOpenAiSdkErrorToRouteError } from "@/lib/ai/openai-error-map";
import { serverEnv } from "@/lib/utils/env";
import type { BusinessSnapshot } from "@/lib/services/business-snapshot";
import type { BusinessRow } from "@/types/database";

/**
 * Boundary between Pliex and OpenAI.
 *
 * Responses are grounded in a deterministic JSON snapshot built from the
 * database. The model is told to refuse generic AI answers and to stay
 * short, practical, and action-oriented.
 *
 * If no API key is configured, returns a deterministic local fallback so
 * the dashboard and /assistant page never look broken in dev.
 */

const SYSTEM_PROMPT_FOOD = `You are Pliex, the AI operating layer for a small food business
(café, bakery, or food shop). Speak like a calm, plain-spoken business advisor.

Rules:
- Be concise. Three to five sentences, max.
- Always ground answers in the JSON snapshot provided. Do not invent numbers.
- Prefer one clear next action over generic advice.
- Use the business' currency from the snapshot.
- Never say "as an AI" or pad with disclaimers.
- If the snapshot is empty, say so honestly and suggest a starting step.`;

const SYSTEM_PROMPT_INTERNET_CAFE = `You are Pliex, the AI operating layer for an internet café
that uses Gizmo Suite for POS, time billing, and PC management. Speak like a calm, plain-spoken owner coach.

Rules:
- Be concise. Three to five sentences, max.
- Ground answers in the JSON snapshot: Pliex totals plus the "gizmo" block from the last Gizmo Web API sync.
- When "gizmo" is null, say you don't have live Gizmo data yet and suggest connecting/syncing in Integrations.
- Never invent PC counts, invoice totals, or stock numbers — only use fields present in the snapshot.
- Prefer one clear next action (pricing, staffing, promos, or floor layout) over generic advice.
- Never say "as an AI" or pad with disclaimers.`;

function systemPromptFor(business: BusinessRow): string {
  if (business.business_type === "internet_cafe" || business.pos_system === "gizmo") {
    return SYSTEM_PROMPT_INTERNET_CAFE;
  }
  return SYSTEM_PROMPT_FOOD;
}

export interface AssistantInput {
  business: BusinessRow;
  snapshot: BusinessSnapshot;
  conversation: Array<{ role: "user" | "assistant"; content: string }>;
  question: string;
}

export async function answerBusinessQuestion(input: AssistantInput): Promise<string> {
  const client = getOpenAiClient();
  if (!client) return localFallbackAnswer(input);

  const groundingMessage = {
    role: "system" as const,
    content: `Business profile:\n${JSON.stringify({
      name: input.business.name,
      type: input.business.business_type,
      pos_system: input.business.pos_system ?? null,
      currency: input.business.currency
    })}\n\nLatest 14-day snapshot (includes gizmo metrics when synced):\n${JSON.stringify(input.snapshot)}`
  };

  try {
    const response = await client.chat.completions.create({
      model: serverEnv.openAiModel,
      temperature: 0.4,
      max_tokens: 350,
      messages: [
        { role: "system", content: systemPromptFor(input.business) },
        groundingMessage,
        ...input.conversation.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: input.question }
      ]
    });

    const text = response.choices[0]?.message?.content?.trim();
    return text && text.length > 0 ? text : localFallbackAnswer(input);
  } catch (err) {
    logOpenAiSdkError("assistant.chat.completions.create", err);
    throw mapOpenAiSdkErrorToRouteError(err);
  }
}

/**
 * Deterministic, no-API-key fallback.
 *
 * Keeps the product feeling alive in dev or when OpenAI is unreachable,
 * by surfacing a few plain numbers from the snapshot.
 */
function localFallbackAnswer(input: AssistantInput): string {
  const t = input.snapshot.totals;
  const profit = t.profitThisWeek;
  const lowStock = input.snapshot.lowStock.length;
  const gz = input.snapshot.gizmo;

  const parts = [
    `This week so far you've taken in ${formatMoney(t.salesThisWeek, input.business.currency)} and spent ${formatMoney(t.expensesThisWeek, input.business.currency)} (profit ${formatMoney(profit, input.business.currency)}).`,
    lowStock > 0
      ? `${lowStock} inventory item(s) are at or below their reorder threshold — that's the most pressing thing to handle.`
      : `Inventory looks healthy.`,
    input.snapshot.weakestWeekday
      ? `Your weakest day right now is ${input.snapshot.weakestWeekday.weekday} — a small promo or shorter shift is worth trying.`
      : `No clear weak day yet — keep logging sales for another week.`
  ];

  if (gz && (gz.hostsTotal > 0 || gz.invoiceCount > 0)) {
    parts.push(
      `Gizmo (last sync): ${gz.hostsInUse} of ${gz.hostsTotal} PCs in use; ~${formatMoney(gz.invoiceRevenueApprox, input.business.currency)} across ${gz.invoiceCount} invoice line(s) in the last payload; ${gz.lowStockProductCount} low-stock product(s) in Gizmo.`
    );
  } else if (input.business.business_type === "internet_cafe") {
    parts.push(`Connect and sync Gizmo under Integrations to see live floor and POS numbers here.`);
  }

  return parts.join(" ");
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount)}`;
  }
}

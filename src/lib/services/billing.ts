import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { isBillingStatusEntitled } from "@/lib/billing/entitlements";
import type { SubscriptionRow, SubscriptionStatus } from "@/types/database";

export interface BillingEntitlement {
  status: SubscriptionStatus | "unsubscribed";
  isEntitled: boolean;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  subscription: SubscriptionRow | null;
}

export async function getBillingEntitlement(
  businessId: string,
  client?: SupabaseClient
): Promise<BillingEntitlement> {
  const supabase = client ?? createSupabaseServerClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("business_id", businessId)
    .maybeSingle();

  if (error) throw error;
  const subscription = (data as SubscriptionRow | null) ?? null;
  const status = subscription?.status ?? "unsubscribed";

  return {
    status,
    isEntitled: isBillingStatusEntitled(status),
    currentPeriodEnd: subscription?.current_period_end ?? null,
    cancelAtPeriodEnd: subscription?.cancel_at_period_end ?? false,
    subscription
  };
}

export async function upsertSubscriptionFromStripe(input: {
  businessId: string;
  stripeCustomerId: string;
  stripeSubscriptionId?: string | null;
  status: SubscriptionStatus;
  priceId?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
  client?: SupabaseClient;
}): Promise<void> {
  const supabase = input.client ?? createSupabaseServerClient();
  const { error } = await supabase.from("subscriptions").upsert(
    {
      business_id: input.businessId,
      stripe_customer_id: input.stripeCustomerId,
      stripe_subscription_id: input.stripeSubscriptionId ?? null,
      status: input.status,
      price_id: input.priceId ?? null,
      current_period_end: input.currentPeriodEnd ?? null,
      cancel_at_period_end: input.cancelAtPeriodEnd ?? false,
      updated_at: new Date().toISOString()
    },
    { onConflict: "business_id" }
  );
  if (error) throw error;
}

export async function getSubscriptionByCustomerId(
  stripeCustomerId: string,
  client?: SupabaseClient
): Promise<SubscriptionRow | null> {
  const supabase = client ?? createSupabaseServerClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  if (error) throw error;
  return (data as SubscriptionRow | null) ?? null;
}

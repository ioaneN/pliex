import type Stripe from "stripe";
import type { SubscriptionStatus } from "@/types/database";

export interface StripeSubscriptionUpsert {
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: SubscriptionStatus;
  priceId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  businessId: string | null;
}

export function mapStripeSubscription(subscription: Stripe.Subscription): StripeSubscriptionUpsert {
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const raw = subscription as unknown as {
    current_period_end?: number | null;
    items: { data: Array<{ price: { id: string } }> };
  };

  return {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    status: subscription.status as SubscriptionStatus,
    priceId: raw.items.data[0]?.price.id ?? null,
    currentPeriodEnd: stripeTimestampToIso(raw.current_period_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    businessId: subscription.metadata.business_id ?? null
  };
}

function stripeTimestampToIso(timestamp: number | null | undefined): string | null {
  return timestamp ? new Date(timestamp * 1000).toISOString() : null;
}

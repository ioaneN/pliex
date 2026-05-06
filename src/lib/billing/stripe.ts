import "server-only";
import Stripe from "stripe";
import { publicEnv, serverEnv } from "@/lib/utils/env";

let stripe: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!serverEnv.stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  stripe ??= new Stripe(serverEnv.stripeSecretKey, {
    apiVersion: "2026-04-22.dahlia"
  });
  return stripe;
}

export async function createCheckoutSession(input: {
  businessId: string;
  userId: string;
  email?: string | null;
  existingCustomerId?: string | null;
}): Promise<Stripe.Checkout.Session> {
  if (!serverEnv.stripePriceId) throw new Error("STRIPE_PRICE_ID is not configured.");
  const client = getStripeClient();
  return client.checkout.sessions.create({
    mode: "subscription",
    customer: input.existingCustomerId ?? undefined,
    customer_email: input.existingCustomerId ? undefined : input.email ?? undefined,
    line_items: [{ price: serverEnv.stripePriceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${publicEnv.siteUrl}/billing?checkout=success`,
    cancel_url: `${publicEnv.siteUrl}/billing?checkout=cancelled`,
    client_reference_id: input.businessId,
    subscription_data: {
      metadata: {
        business_id: input.businessId,
        owner_user_id: input.userId
      }
    },
    metadata: {
      business_id: input.businessId,
      owner_user_id: input.userId
    }
  });
}

export async function createPortalSession(stripeCustomerId: string): Promise<Stripe.BillingPortal.Session> {
  return getStripeClient().billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${publicEnv.siteUrl}/settings`
  });
}

export function stripeTimestampToIso(timestamp: number | null | undefined): string | null {
  return timestamp ? new Date(timestamp * 1000).toISOString() : null;
}

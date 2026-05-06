import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/billing/stripe";
import { mapStripeSubscription } from "@/lib/billing/stripe-webhook";
import { serverEnv } from "@/lib/utils/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { getSubscriptionByCustomerId, upsertSubscriptionFromStripe } from "@/lib/services/billing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!serverEnv.stripeWebhookSecret) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    const body = await request.text();
    event = getStripeClient().webhooks.constructEvent(body, signature, serverEnv.stripeWebhookSecret);
  } catch (error) {
    console.error("[stripe/webhook] signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Service role not configured" }, { status: 503 });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;
        if (subscriptionId) {
          const subscription = await getStripeClient().subscriptions.retrieve(subscriptionId);
          await persistSubscription(subscription, admin, session.metadata?.business_id ?? session.client_reference_id);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await persistSubscription(event.data.object as Stripe.Subscription, admin);
        break;
      }
      case "invoice.paid":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          typeof (invoice as unknown as { subscription?: unknown }).subscription === "string"
            ? ((invoice as unknown as { subscription: string }).subscription)
            : null;
        if (subscriptionId) {
          const subscription = await getStripeClient().subscriptions.retrieve(subscriptionId);
          await persistSubscription(subscription, admin);
        }
        break;
      }
      default:
        break;
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe/webhook] handler failed", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function persistSubscription(
  subscription: Stripe.Subscription,
  admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  fallbackBusinessId?: string | null
) {
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const existing = await getSubscriptionByCustomerId(customerId, admin);
  const mapped = mapStripeSubscription(subscription);
  const businessId = mapped.businessId ?? fallbackBusinessId ?? existing?.business_id;
  if (!businessId) {
    throw new Error(`No business id mapped for Stripe customer ${customerId}`);
  }

  await upsertSubscriptionFromStripe({
    businessId,
    stripeCustomerId: mapped.stripeCustomerId,
    stripeSubscriptionId: mapped.stripeSubscriptionId,
    status: mapped.status,
    priceId: mapped.priceId,
    currentPeriodEnd: mapped.currentPeriodEnd,
    cancelAtPeriodEnd: mapped.cancelAtPeriodEnd,
    client: admin
  });
}

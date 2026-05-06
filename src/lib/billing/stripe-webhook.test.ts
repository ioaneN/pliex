import { describe, expect, it } from "vitest";
import { mapStripeSubscription } from "@/lib/billing/stripe-webhook";

describe("mapStripeSubscription", () => {
  it("maps Stripe subscription payloads into DB upserts", () => {
    const mapped = mapStripeSubscription({
      id: "sub_123",
      customer: "cus_123",
      status: "active",
      current_period_end: 1770000000,
      cancel_at_period_end: true,
      metadata: { business_id: "biz_123" },
      items: { data: [{ price: { id: "price_123" } }] }
    } as never);

    expect(mapped).toEqual({
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      status: "active",
      priceId: "price_123",
      currentPeriodEnd: "2026-02-02T02:40:00.000Z",
      cancelAtPeriodEnd: true,
      businessId: "biz_123"
    });
  });
});

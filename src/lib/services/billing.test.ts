import { describe, expect, it } from "vitest";
import { isBillingStatusEntitled } from "@/lib/billing/entitlements";

describe("isBillingStatusEntitled", () => {
  it("allows active and trialing subscriptions only", () => {
    expect(isBillingStatusEntitled("active")).toBe(true);
    expect(isBillingStatusEntitled("trialing")).toBe(true);
    expect(isBillingStatusEntitled("past_due")).toBe(false);
    expect(isBillingStatusEntitled("canceled")).toBe(false);
    expect(isBillingStatusEntitled("unsubscribed")).toBe(false);
  });
});

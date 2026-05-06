import type { SubscriptionStatus } from "@/types/database";

const ENTITLED_STATUSES: Array<SubscriptionStatus | "unsubscribed"> = ["active", "trialing"];

export function isBillingStatusEntitled(status: SubscriptionStatus | "unsubscribed"): boolean {
  return ENTITLED_STATUSES.includes(status);
}

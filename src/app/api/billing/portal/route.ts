import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { getOwnedBusiness } from "@/lib/services/businesses";
import { getBillingEntitlement } from "@/lib/services/billing";
import { createPortalSession } from "@/lib/billing/stripe";

export const runtime = "nodejs";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const business = await getOwnedBusiness();
  if (!business) return NextResponse.json({ error: "No business" }, { status: 400 });

  const entitlement = await getBillingEntitlement(business.id);
  const customerId = entitlement.subscription?.stripe_customer_id;
  if (!customerId) {
    return NextResponse.json({ error: "No Stripe customer yet. Start checkout first." }, { status: 400 });
  }

  try {
    const session = await createPortalSession(customerId);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[billing/portal]", error);
    return NextResponse.json({ error: "Could not open billing portal. Please try again." }, { status: 500 });
  }
}

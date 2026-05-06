import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { getOwnedBusiness } from "@/lib/services/businesses";
import { getBillingEntitlement } from "@/lib/services/billing";
import { createCheckoutSession } from "@/lib/billing/stripe";

export const runtime = "nodejs";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const business = await getOwnedBusiness();
  if (!business) return NextResponse.json({ error: "No business" }, { status: 400 });

  try {
    const entitlement = await getBillingEntitlement(business.id);
    const session = await createCheckoutSession({
      businessId: business.id,
      userId: user.id,
      email: user.email,
      existingCustomerId: entitlement.subscription?.stripe_customer_id ?? null
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[billing/checkout]", error);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
  }
}

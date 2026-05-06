import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader, CardSubtitle, CardTitle } from "@/components/ui/card";
import { BillingActions } from "@/components/billing/billing-actions";
import { getOwnedBusiness } from "@/lib/services/businesses";
import { getBillingEntitlement } from "@/lib/services/billing";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const business = await getOwnedBusiness();
  if (!business) redirect("/onboarding");

  const entitlement = await getBillingEntitlement(business.id);

  return (
    <>
      <PageHeader
        eyebrow="Billing"
        title={entitlement.isEntitled ? "Your subscription is active" : "Activate Pliex"}
        subtitle="Subscribe to keep dashboards, AI guidance, and Square sync available for your workspace."
      />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Pliex Pro</CardTitle>
            <CardSubtitle>Customer-ready access for one internet café workspace.</CardSubtitle>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <Info label="Status" value={prettyStatus(entitlement.status)} />
            <Info
              label="Renews"
              value={
                entitlement.currentPeriodEnd
                  ? new Date(entitlement.currentPeriodEnd).toLocaleDateString()
                  : "After checkout"
              }
            />
            <Info label="Plan" value="Pliex Pro" />
          </dl>

          {!entitlement.isEntitled && (
            <p className="rounded-md border border-brass/40 bg-brass/10 px-3 py-2 text-sm text-navy-900">
              Your workspace is ready. Start the subscription to unlock the dashboard, assistant, and Square sync.
            </p>
          )}

          <BillingActions
            hasCustomer={!!entitlement.subscription?.stripe_customer_id}
            isEntitled={entitlement.isEntitled}
          />
        </CardBody>
      </Card>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-white p-3">
      <dt className="text-[11px] font-semibold uppercase tracking-widest text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-navy-900">{value}</dd>
    </div>
  );
}

function prettyStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

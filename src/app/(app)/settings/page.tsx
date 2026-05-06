import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader, CardSubtitle, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BillingActions } from "@/components/billing/billing-actions";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { getOwnedBusiness } from "@/lib/services/businesses";
import { getBillingEntitlement } from "@/lib/services/billing";
import { getSquareConnectionSafe } from "@/lib/services/square";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const business = await getOwnedBusiness();
  const [billing, square] = business
    ? await Promise.all([getBillingEntitlement(business.id), getSquareConnectionSafe(business.id)])
    : [null, null] as const;

  return (
    <>
      <PageHeader
        eyebrow="Workspace settings"
        title="Settings"
        subtitle="Manage your account access and quick operational preferences for this workspace."
      />

      <section className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Account</CardTitle>
            <CardSubtitle>Signed in with Google</CardSubtitle>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <dl className="grid gap-3 text-sm text-ink-soft sm:grid-cols-2">
            <div className="rounded-md border border-line bg-white p-3">
              <dt className="text-[11px] font-semibold uppercase tracking-widest text-muted">Name</dt>
              <dd className="mt-1 text-sm text-navy-900">
                {(user?.user_metadata?.full_name as string | undefined) ??
                  (user?.user_metadata?.name as string | undefined) ??
                  "Owner"}
              </dd>
            </div>
            <div className="rounded-md border border-line bg-white p-3">
              <dt className="text-[11px] font-semibold uppercase tracking-widest text-muted">Email</dt>
              <dd className="mt-1 text-sm text-navy-900">{user?.email ?? "Unavailable"}</dd>
            </div>
          </dl>

          <form action="/auth/sign-out" method="post">
            <Button type="submit" variant="ghost" size="md">
              Sign out
            </Button>
          </form>
        </CardBody>
      </Card>

      {billing && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Billing</CardTitle>
              <CardSubtitle>Subscription and payment method are managed securely by Stripe.</CardSubtitle>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Info label="Status" value={prettyStatus(billing.status)} />
              <Info
                label="Renews"
                value={billing.currentPeriodEnd ? new Date(billing.currentPeriodEnd).toLocaleDateString() : "—"}
              />
            </dl>
            <BillingActions hasCustomer={!!billing.subscription?.stripe_customer_id} isEntitled={billing.isEntitled} />
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Square</CardTitle>
            <CardSubtitle>POS connection status for synced sales.</CardSubtitle>
          </div>
        </CardHeader>
        <CardBody>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Info label="Connection" value={square?.connected_at && !square.disconnected_at ? "Connected" : "Not connected"} />
            <Info label="Last sync" value={square?.last_sync_at ? new Date(square.last_sync_at).toLocaleString() : "Never"} />
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Support</CardTitle>
            <CardSubtitle>Need help connecting Square or reading your dashboard?</CardSubtitle>
          </div>
        </CardHeader>
        <CardBody>
          <a className="text-sm font-semibold text-navy-700 underline-offset-2 hover:underline" href="mailto:support@pliex.app">
            support@pliex.app
          </a>
        </CardBody>
      </Card>
      </section>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-white p-3">
      <dt className="text-[11px] font-semibold uppercase tracking-widest text-muted">{label}</dt>
      <dd className="mt-1 text-sm text-navy-900">{value}</dd>
    </div>
  );
}

function prettyStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

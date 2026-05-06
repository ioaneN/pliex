import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { SquareConnectForm } from "@/components/integrations/square-connect-form";
import { getOwnedBusiness } from "@/lib/services/businesses";
import { getSquareConnectionSafe } from "@/lib/services/square";

export const dynamic = "force-dynamic";

export default async function SquareIntegrationsPage({
  searchParams
}: {
  searchParams?: { connected?: string; error?: string };
}) {
  const business = await getOwnedBusiness();
  if (!business) redirect("/onboarding");

  const connection = await getSquareConnectionSafe(business.id);

  return (
    <>
      <PageHeader
        eyebrow="Integrations"
        title="Square"
        subtitle="Connect securely with Square OAuth, then sync completed POS payments into Pliex."
      />

      <SquareConnectForm
        initialConnection={connection}
        oauthMessage={searchParams?.connected ? "Square connected successfully." : null}
        oauthError={searchParams?.error ? "Square connection could not be completed. Please try again." : null}
      />

      <p className="text-sm text-muted">
        <Link href="/dashboard" className="font-medium text-navy-700 underline-offset-2 hover:underline">
          ← Back to dashboard
        </Link>
      </p>
    </>
  );
}

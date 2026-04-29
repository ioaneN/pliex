import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { GizmoConnectForm } from "@/components/integrations/gizmo-connect-form";
import { getOwnedBusiness } from "@/lib/services/businesses";
import { getGizmoConnection } from "@/lib/services/gizmo";

export const dynamic = "force-dynamic";

export default async function GizmoIntegrationsPage() {
  const business = await getOwnedBusiness();
  if (!business) redirect("/onboarding");

  const connection = await getGizmoConnection(business.id);

  return (
    <>
      <PageHeader
        eyebrow="Integrations"
        title="Gizmo Suite"
        subtitle="Connect your on-prem Gizmo Web API through a public HTTPS URL, then sync so Pliex and the AI see the same snapshot."
      />

      <GizmoConnectForm initialConnection={connection} />

      <p className="text-sm text-muted">
        <Link href="/dashboard" className="font-medium text-navy-700 underline-offset-2 hover:underline">
          ← Back to dashboard
        </Link>
      </p>
    </>
  );
}

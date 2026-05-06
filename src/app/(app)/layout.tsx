import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { getOwnedBusiness } from "@/lib/services/businesses";
import { getBillingEntitlement } from "@/lib/services/billing";

/**
 * Layout for every authenticated, business-scoped page.
 *
 * Responsibilities:
 *  - require an authenticated Google user (delegated to middleware as well)
 *  - if the user has not finished onboarding, send them to /onboarding
 *  - hand the resolved business + owner identity down to the chrome
 */
export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const business = await getOwnedBusiness();
  if (!business) redirect("/onboarding");

  const pathname = headers().get("x-pathname") ?? "";
  const billing = await getBillingEntitlement(business.id);
  const canAccessWhenUnpaid =
    pathname.startsWith("/billing") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/help");
  if (!billing.isEntitled && !canAccessWhenUnpaid) {
    redirect("/billing");
  }

  const ownerName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    null;

  return (
    <AppShell businessName={business.name} ownerName={ownerName} ownerEmail={user.email ?? ""}>
      {children}
    </AppShell>
  );
}

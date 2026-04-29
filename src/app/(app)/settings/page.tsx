import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader, CardSubtitle, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/supabase/get-current-user";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <>
      <PageHeader
        eyebrow="Workspace settings"
        title="Settings"
        subtitle="Manage your account access and quick operational preferences for this workspace."
      />

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
    </>
  );
}

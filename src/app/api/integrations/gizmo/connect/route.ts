import { NextResponse } from "next/server";
import { gizmoConnectSchema } from "@/lib/validation/schemas";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { getOwnedBusiness } from "@/lib/services/businesses";
import { getGizmoConnection, syncGizmoForBusiness, upsertGizmoConnection } from "@/lib/services/gizmo";
import { probeGizmoConnection } from "@/lib/integrations/gizmo/client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const business = await getOwnedBusiness();
  if (!business) return NextResponse.json({ error: "No business" }, { status: 400 });

  const body = await request.json().catch(() => null);
  const parsed = gizmoConnectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 422 });
  }

  const { baseUrl, apiUsername, apiPassword: passwordInput } = parsed.data;

  const existing = await getGizmoConnection(business.id);
  if (!existing && passwordInput.length === 0) {
    return NextResponse.json(
      { error: "Enter the operator password the first time you connect." },
      { status: 400 }
    );
  }

  const apiPassword =
    passwordInput.length > 0 ? passwordInput : (existing?.api_password ?? "");

  const probe = await probeGizmoConnection({
    baseUrl,
    apiUsername,
    apiPassword
  });

  if (!probe.ok) {
    return NextResponse.json({ error: probe.message }, { status: 400 });
  }

  try {
    await upsertGizmoConnection({
      businessId: business.id,
      baseUrl,
      apiUsername,
      apiPassword
    });

    // First-time UX: once connection is valid, sync immediately so dashboard/AI show live data.
    const sync = await syncGizmoForBusiness(business.id);
    const row = await getGizmoConnection(business.id);

    const message = sync.ok
      ? "Connected and synced. Dashboard and AI now use your latest Gizmo snapshot."
      : `Connected, but initial sync needs attention: ${sync.error ?? "Sync failed"}. You can retry from Integrations.`;

    return NextResponse.json({
      ok: true,
      message,
      sync: {
        ok: sync.ok,
        error: sync.error,
        salesApplied: sync.salesApplied ?? 0
      },
      connection: {
        id: row?.id ?? null,
        base_url: row?.base_url ?? baseUrl,
        last_sync_at: row?.last_sync_at ?? null,
        last_sync_status: row?.last_sync_status ?? null
      }
    });
  } catch (e) {
    console.error("[gizmo/connect]", e);
    return NextResponse.json({ error: "Could not save the connection. Please try again." }, { status: 500 });
  }
}

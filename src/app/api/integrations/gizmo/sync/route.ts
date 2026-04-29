import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { getOwnedBusiness } from "@/lib/services/businesses";
import { getGizmoConnection, syncGizmoForBusiness } from "@/lib/services/gizmo";

export const runtime = "nodejs";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const business = await getOwnedBusiness();
  if (!business) return NextResponse.json({ error: "No business" }, { status: 400 });

  const conn = await getGizmoConnection(business.id);
  if (!conn) {
    return NextResponse.json({ error: "Connect Gizmo first in Integrations." }, { status: 400 });
  }

  const result = await syncGizmoForBusiness(business.id);
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error ?? "Sync failed",
        normalized: result.payload?.normalized,
        salesApplied: result.salesApplied ?? 0
      },
      { status: 200 }
    );
  }

  return NextResponse.json({
    ok: true,
    normalized: result.payload?.normalized,
    salesApplied: result.salesApplied ?? 0
  });
}

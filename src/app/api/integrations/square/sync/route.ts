import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { getOwnedBusiness } from "@/lib/services/businesses";
import { getSquareConnection, syncSquareForBusiness } from "@/lib/services/square";

export const runtime = "nodejs";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const business = await getOwnedBusiness();
  if (!business) return NextResponse.json({ error: "No business" }, { status: 400 });

  const conn = await getSquareConnection(business.id);
  if (!conn) {
    return NextResponse.json({ error: "Connect Square first in Integrations." }, { status: 400 });
  }

  const result = await syncSquareForBusiness(business.id);
  if (!result.ok) {
    return NextResponse.json({ ...result, ok: false, error: result.error ?? "Sync failed" }, { status: 200 });
  }

  return NextResponse.json({ ...result, ok: true });
}

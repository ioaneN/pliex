import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { getOwnedBusiness } from "@/lib/services/businesses";
import { disconnectSquareConnection } from "@/lib/services/square";

export const runtime = "nodejs";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const business = await getOwnedBusiness();
  if (!business) return NextResponse.json({ error: "No business" }, { status: 400 });

  try {
    await disconnectSquareConnection(business.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[square/disconnect]", error);
    return NextResponse.json({ error: "Could not disconnect Square. Please try again." }, { status: 500 });
  }
}

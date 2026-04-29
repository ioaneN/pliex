import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/utils/env";
import { syncAllGizmoConnections } from "@/lib/services/gizmo";

export const runtime = "nodejs";

/**
 * Secured with `Authorization: Bearer ${CRON_SECRET}` (Vercel Cron or manual).
 */
export async function GET(request: Request) {
  const secret = serverEnv.cronSecret;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncAllGizmoConnections();
  return NextResponse.json(result);
}

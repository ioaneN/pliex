import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/utils/env";
import { syncAllSquareConnections } from "@/lib/services/square";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!serverEnv.cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${serverEnv.cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncAllSquareConnections();
  return NextResponse.json(result);
}

import "server-only";

export type SquareEnvironment = "production" | "sandbox";

export interface SquareCredentials {
  accessToken: string;
  environment: SquareEnvironment;
}

export interface SquarePayment {
  id: string;
  created_at?: string;
  amount_money?: { amount?: number };
  status?: string;
  note?: string;
  order_id?: string;
  location_id?: string;
}

interface ListPaymentsArgs extends SquareCredentials {
  locationId?: string | null;
  beginTime?: string;
}

export function squareApiBaseUrl(environment: SquareEnvironment): string {
  return environment === "sandbox"
    ? "https://connect.squareupsandbox.com"
    : "https://connect.squareup.com";
}

function authHeaders(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    "Square-Version": "2026-03-18"
  };
}

export async function fetchSquareLocations(creds: SquareCredentials): Promise<{
  ok: boolean;
  status: number;
  locations: Array<{ id: string; name?: string }>;
  error?: string;
}> {
  const res = await fetch(`${squareApiBaseUrl(creds.environment)}/v2/locations`, {
    method: "GET",
    headers: authHeaders(creds.accessToken),
    cache: "no-store",
    next: { revalidate: 0 }
  });
  const body = (await res.json().catch(() => ({}))) as {
    locations?: Array<{ id: string; name?: string }>;
    errors?: Array<{ detail?: string }>;
  };
  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      locations: [],
      error: body.errors?.map((e) => e.detail).filter(Boolean).join("; ") || `HTTP ${res.status}`
    };
  }
  return { ok: true, status: res.status, locations: body.locations ?? [] };
}

export async function probeSquareConnection(
  creds: SquareCredentials & { locationId?: string | null }
): Promise<{ ok: boolean; message: string; resolvedLocationId: string | null }> {
  try {
    const locations = await fetchSquareLocations(creds);
    if (!locations.ok) {
      return {
        ok: false,
        message: locations.error || "Square authentication failed.",
        resolvedLocationId: null
      };
    }

    const requested = creds.locationId?.trim() ?? "";
    if (requested.length > 0) {
      const exists = locations.locations.some((l) => l.id === requested);
      if (!exists) {
        return {
          ok: false,
          message: "Location id not found for this Square account.",
          resolvedLocationId: null
        };
      }
      return { ok: true, message: "Square connection is valid.", resolvedLocationId: requested };
    }

    const first = locations.locations[0]?.id ?? null;
    if (!first) {
      return {
        ok: false,
        message: "No locations found in this Square account.",
        resolvedLocationId: null
      };
    }
    return { ok: true, message: "Square connection is valid.", resolvedLocationId: first };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not reach Square",
      resolvedLocationId: null
    };
  }
}

export async function listSquarePayments(args: ListPaymentsArgs): Promise<{
  ok: boolean;
  status: number;
  payments: SquarePayment[];
  error?: string;
}> {
  const payments: SquarePayment[] = [];
  let cursor: string | null = null;
  let guard = 0;
  const beginTime = args.beginTime ?? new Date(Date.now() - 30 * 86_400_000).toISOString();

  while (guard < 20) {
    const url = new URL(`${squareApiBaseUrl(args.environment)}/v2/payments`);
    url.searchParams.set("sort_order", "ASC");
    url.searchParams.set("begin_time", beginTime);
    if (args.locationId) url.searchParams.set("location_id", args.locationId);
    if (cursor) url.searchParams.set("cursor", cursor);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: authHeaders(args.accessToken),
      cache: "no-store",
      next: { revalidate: 0 }
    });
    const body = (await res.json().catch(() => ({}))) as {
      payments?: SquarePayment[];
      cursor?: string;
      errors?: Array<{ detail?: string }>;
    };

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        payments,
        error: body.errors?.map((e) => e.detail).filter(Boolean).join("; ") || `HTTP ${res.status}`
      };
    }

    payments.push(...(body.payments ?? []));
    if (!body.cursor) break;
    cursor = body.cursor;
    guard++;
  }

  return { ok: true, status: 200, payments };
}

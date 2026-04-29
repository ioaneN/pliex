import "server-only";

export interface GizmoFetchCredentials {
  baseUrl: string;
  apiUsername: string;
  apiPassword: string;
}

const API_PATHS = ["/api/host", "/api/invoice", "/api/product"] as const;

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

function authHeader(username: string, password: string): string {
  const token = Buffer.from(`${username}:${password}`, "utf8").toString("base64");
  return `Basic ${token}`;
}

export async function fetchGizmoEndpoints(
  creds: GizmoFetchCredentials,
  signal?: AbortSignal
): Promise<Record<string, { status: number; body: unknown }>> {
  const base = normalizeBaseUrl(creds.baseUrl);
  const headers: Record<string, string> = {
    Accept: "application/json"
  };
  if (creds.apiUsername || creds.apiPassword) {
    headers.Authorization = authHeader(creds.apiUsername, creds.apiPassword);
  }

  const out: Record<string, { status: number; body: unknown }> = {};

  await Promise.all(
    API_PATHS.map(async (path) => {
      const key = path.replace("/api/", "");
      try {
        const res = await fetch(`${base}${path}`, {
          method: "GET",
          headers,
          signal,
          cache: "no-store",
          next: { revalidate: 0 }
        });
        let body: unknown = null;
        const text = await res.text();
        if (text) {
          try {
            body = JSON.parse(text) as unknown;
          } catch {
            body = text;
          }
        }
        out[key] = { status: res.status, body };
      } catch (e) {
        out[key] = {
          status: 0,
          body: { error: e instanceof Error ? e.message : "fetch failed" }
        };
      }
    })
  );

  return out;
}

export async function probeGizmoConnection(creds: GizmoFetchCredentials): Promise<{
  ok: boolean;
  message: string;
}> {
  const raw = await fetchGizmoEndpoints(creds, AbortSignal.timeout(15_000));
  const host = raw.host;
  if (host && host.status >= 200 && host.status < 300) {
    return { ok: true, message: "Gizmo responded successfully." };
  }
  const firstErr = Object.entries(raw).find(([, v]) => v.status === 401 || v.status === 403);
  if (firstErr) {
    return { ok: false, message: "Authentication failed. Check operator username and password." };
  }
  const anyOk = Object.values(raw).some((v) => v.status >= 200 && v.status < 300);
  if (anyOk) {
    return { ok: true, message: "Gizmo Web API reachable." };
  }
  const status = raw.host?.status ?? 0;
  if (status === 0) {
    return { ok: false, message: "Could not reach the server. Check the URL and tunnel." };
  }
  return {
    ok: false,
    message: `Unexpected response (HTTP ${status}). Enable the Web portal in Gizmo Manager → WEB.`
  };
}

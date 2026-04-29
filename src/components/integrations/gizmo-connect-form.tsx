"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GizmoConnectionRow } from "@/types/database";

interface Props {
  initialConnection: GizmoConnectionRow | null;
}

export function GizmoConnectForm({ initialConnection }: Props) {
  const router = useRouter();
  const [baseUrl, setBaseUrl] = useState(initialConnection?.base_url ?? "");
  const [apiUsername, setApiUsername] = useState(initialConnection?.api_username ?? "");
  const [apiPassword, setApiPassword] = useState("");
  const [hasConnection, setHasConnection] = useState(!!initialConnection);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingConnect, setPendingConnect] = useState(false);
  const [pendingSync, setPendingSync] = useState(false);

  async function connect() {
    setError(null);
    setMessage(null);
    setPendingConnect(true);
    try {
      const res = await fetch("/api/integrations/gizmo/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseUrl, apiUsername, apiPassword })
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setError(data.error ?? "Connection failed");
        return;
      }
      setHasConnection(true);
      setMessage(data.message ?? "Connected.");
      setApiPassword("");
      router.refresh();
    } catch {
      setError("Could not reach Pliex. Check your connection and try again.");
    } finally {
      setPendingConnect(false);
    }
  }

  async function sync() {
    setError(null);
    setMessage(null);
    setPendingSync(true);
    try {
      const res = await fetch("/api/integrations/gizmo/sync", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        normalized?: unknown;
      };
      if (!res.ok) {
        setError(data.error ?? "Sync failed");
        return;
      }
      if (data.ok === false) {
        setError(data.error ?? "Sync failed");
        return;
      }
      setMessage("Sync complete. Dashboard and AI now use the latest Gizmo snapshot.");
      router.refresh();
    } catch {
      setError("Sync could not start. Please check your connection and retry.");
    } finally {
      setPendingSync(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-line bg-white p-4 text-sm text-ink-soft">
        <ol className="list-decimal space-y-2 pl-4">
          <li>In Gizmo Manager, open <strong>WEB</strong> and enable the web portal (HTTP/API).</li>
          <li>
            Expose that port with a tunnel (e.g. Cloudflare Tunnel or ngrok) so you get an{' '}
            <code className="rounded bg-navy-900/5 px-1">https://</code> URL Pliex can reach.
          </li>
          <li>Paste the public base URL and operator credentials below (use a dedicated operator if possible).</li>
        </ol>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-widest text-navy-700">Gizmo Web base URL</span>
        <Input
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://your-tunnel.example.com"
          autoComplete="url"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-widest text-navy-700">Operator username</span>
        <Input
          value={apiUsername}
          onChange={(e) => setApiUsername(e.target.value)}
          placeholder="e.g. admin"
          autoComplete="username"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-widest text-navy-700">Operator password</span>
        <Input
          type="password"
          value={apiPassword}
          onChange={(e) => setApiPassword(e.target.value)}
          placeholder={initialConnection ? "Leave blank to keep current password" : "Password"}
          autoComplete="current-password"
        />
      </label>

      {error && (
        <p className="rounded-md border border-bad/30 bg-bad-soft px-3 py-2 text-sm text-bad">{error}</p>
      )}
      {message && (
        <p className="rounded-md border border-line bg-white px-3 py-2 text-sm text-navy-800">{message}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="lg" disabled={pendingConnect || !baseUrl.trim()} onClick={() => void connect()}>
          {pendingConnect ? "Testing & syncing…" : "Save, test & sync"}
        </Button>
        <Button
          type="button"
          variant="link"
          size="lg"
          disabled={pendingSync || !hasConnection}
          onClick={() => void sync()}
        >
          {pendingSync ? "Syncing…" : "Refresh from Gizmo"}
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { SafeSquareConnection } from "@/types/database";

interface Props {
  initialConnection: SafeSquareConnection | null;
  oauthMessage?: string | null;
  oauthError?: string | null;
}

export function SquareConnectForm({ initialConnection, oauthMessage, oauthError }: Props) {
  const router = useRouter();
  const isConnected = !!initialConnection?.connected_at && !initialConnection.disconnected_at;
  const [hasConnection, setHasConnection] = useState(isConnected);
  const [message, setMessage] = useState<string | null>(oauthMessage ?? null);
  const [error, setError] = useState<string | null>(oauthError ?? null);
  const [pendingSync, setPendingSync] = useState(false);
  const [pendingDisconnect, setPendingDisconnect] = useState(false);

  function connect() {
    setError(null);
    setMessage(null);
    window.location.href = "/api/integrations/square/oauth/start";
  }

  async function sync() {
    setError(null);
    setMessage(null);
    setPendingSync(true);
    try {
      const res = await fetch("/api/integrations/square/sync", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        salesApplied?: number;
      };
      if (!res.ok) {
        setError(data.error ?? "Sync failed");
        return;
      }
      if (data.ok === false) {
        setError(data.error ?? "Sync failed");
        return;
      }
      setMessage(`Sync complete. Imported ${data.salesApplied ?? 0} row(s) from Square.`);
      router.refresh();
    } catch {
      setError("Sync could not start. Please check your connection and retry.");
    } finally {
      setPendingSync(false);
    }
  }

  async function disconnect() {
    setError(null);
    setMessage(null);
    setPendingDisconnect(true);
    try {
      const res = await fetch("/api/integrations/square/disconnect", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Disconnect failed");
        return;
      }
      setHasConnection(false);
      setMessage("Square disconnected.");
      router.refresh();
    } catch {
      setError("Disconnect could not start. Please retry.");
    } finally {
      setPendingDisconnect(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-line bg-white p-4 text-sm text-ink-soft">
        <ol className="list-decimal space-y-2 pl-4">
          <li>Click Connect with Square and approve Pliex in your Square account.</li>
          <li>Pliex stores encrypted OAuth tokens and syncs completed payments into your sales ledger.</li>
          <li>You can refresh manually any time; scheduled reconciliation keeps the ledger fresh.</li>
        </ol>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-3">
        <Info label="Status" value={hasConnection ? "Connected" : "Not connected"} />
        <Info label="Merchant" value={initialConnection?.merchant_id ?? "—"} />
        <Info
          label="Last sync"
          value={initialConnection?.last_sync_at ? new Date(initialConnection.last_sync_at).toLocaleString() : "Never"}
        />
      </dl>

      {error && (
        <p className="rounded-md border border-bad/30 bg-bad-soft px-3 py-2 text-sm text-bad">{error}</p>
      )}
      {message && (
        <p className="rounded-md border border-line bg-white px-3 py-2 text-sm text-navy-800">{message}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="lg" onClick={connect}>
          {hasConnection ? "Reconnect Square" : "Connect with Square"}
        </Button>
        <Button
          type="button"
          variant="link"
          size="lg"
          disabled={pendingSync || !hasConnection}
          onClick={() => void sync()}
        >
          {pendingSync ? "Syncing…" : "Refresh from Square"}
        </Button>
        {hasConnection && (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            disabled={pendingDisconnect}
            onClick={() => void disconnect()}
          >
            {pendingDisconnect ? "Disconnecting…" : "Disconnect"}
          </Button>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-white p-3">
      <dt className="text-[11px] font-semibold uppercase tracking-widest text-muted">{label}</dt>
      <dd className="mt-1 text-sm text-navy-900">{value}</dd>
    </div>
  );
}

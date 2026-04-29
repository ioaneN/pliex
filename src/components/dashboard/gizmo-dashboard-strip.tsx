import Link from "next/link";
import { KpiCard } from "@/components/dashboard/kpi-card";
import type { BusinessSnapshot } from "@/lib/services/business-snapshot";
import { formatCurrency } from "@/lib/utils/format";
import type { GizmoConnectionRow } from "@/types/database";

interface Props {
  connection: GizmoConnectionRow | null;
  snapshot: BusinessSnapshot;
  currency: string;
}

export function GizmoDashboardStrip({ connection, snapshot, currency }: Props) {
  const g = snapshot.gizmo;
  const lastAt = connection?.last_sync_at
    ? new Date(connection.last_sync_at).toLocaleString()
    : null;
  const err = connection?.last_sync_status === "error" ? connection.last_error : null;
  const syncLabel =
    connection?.last_sync_status === "ok"
      ? "Synced"
      : connection?.last_sync_status === "error"
        ? "Needs attention"
        : "Pending";
  const statusHint =
    connection?.last_sync_status === "ok"
      ? "Live Gizmo data is connected to your dashboard."
      : connection?.last_sync_status === "error"
        ? "Connected, but the last sync failed. Check details and retry from Integrations."
        : "Connected. Run a sync from Integrations to pull live data.";

  return (
    <section className="rounded-xl border border-line bg-white/80 p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg font-semibold text-navy-900">Gizmo</h2>
          <p className="mt-0.5 text-sm text-ink-soft">
            {connection
              ? `Last sync: ${lastAt ?? "never"} · ${syncLabel}`
              : "Not connected — add your tunnel URL and operator login in Integrations."}
          </p>
          {connection && !err && <p className="mt-1 text-xs text-ink-soft">{statusHint}</p>}
          {err && <p className="mt-1 text-xs text-bad">{err}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/integrations/gizmo"
            className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold text-navy-700 underline-offset-4 transition hover:text-navy-900"
          >
            {connection ? "Manage" : "Connect Gizmo →"}
          </Link>
        </div>
      </div>

      {g && (g.hostsTotal > 0 || g.invoiceCount > 0 || g.lowStockProductCount > 0) ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <KpiCard
            label="PCs in use"
            value={`${g.hostsInUse} / ${g.hostsTotal}`}
            footnote="From last Gizmo host payload"
          />
          <KpiCard
            label="Invoices (payload)"
            value={String(g.invoiceCount)}
            footnote={`Mapped total ${formatCurrency(g.invoiceRevenueApprox, currency)} (last sync)`}
          />
          <KpiCard
            label="Gizmo low stock"
            value={String(g.lowStockProductCount)}
            footnote="Products at or below threshold in Gizmo"
          />
        </div>
      ) : connection ? (
        <p className="mt-3 text-sm text-muted">
          Connection is active, but there is no measurable host/invoice/stock data yet. This can happen when there was
          no recent activity or when API payload shapes changed. Run another refresh after activity in Gizmo.
        </p>
      ) : null}
    </section>
  );
}

import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { RecommendationCard } from "@/components/dashboard/recommendation-card";
import { InventoryAlertCard } from "@/components/dashboard/inventory-alert-card";
import { ActivityList } from "@/components/dashboard/activity-list";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { getOwnedBusiness } from "@/lib/services/businesses";
import { buildBusinessSnapshot } from "@/lib/services/business-snapshot";
import { getGizmoConnection } from "@/lib/services/gizmo";
import { GizmoDashboardStrip } from "@/components/dashboard/gizmo-dashboard-strip";
import { listRecentSales } from "@/lib/services/sales";
import { listRecentExpenses } from "@/lib/services/expenses";
import { generateRecommendations, pickTopByType } from "@/lib/recommendations/engine";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { getCurrentUser } from "@/lib/supabase/get-current-user";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const business = await getOwnedBusiness();
  if (!business) redirect("/onboarding");

  const user = await getCurrentUser();
  const ownerFirstName =
    (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ?? "there";

  const [snapshot, recentSales, recentExpenses, gizmoConnection] = await Promise.all([
    buildBusinessSnapshot(business.id),
    listRecentSales(business.id, 6),
    listRecentExpenses(business.id, 6),
    getGizmoConnection(business.id)
  ]);

  const totals = snapshot.totals;
  const drafts = generateRecommendations(snapshot);
  const topGrowth = pickTopByType(drafts, "growth");
  const topSavings = pickTopByType(drafts, "savings");
  const topRisk = pickTopByType(drafts, "risk");

  const salesDeltaPct = pctDelta(totals.salesYesterday, twoDaysAgoTotal(totals));
  const expenseDeltaPct = pctDelta(totals.expensesYesterday, twoDaysAgoExpense(totals));
  const profitYesterday = totals.salesYesterday - totals.expensesYesterday;

  return (
    <>
      <PageHeader
        eyebrow={prettyToday()}
        title={
          <>
            Good morning, <em className="font-medium not-italic text-navy-600">{ownerFirstName}</em>.
          </>
        }
        subtitle="Here's what your business looks like today — and what Pliex thinks you should focus on."
      />

      <SummaryCard message={buildSummary(business.currency, totals, snapshot.lowStock.length)} />

      <GizmoDashboardStrip
        connection={gizmoConnection}
        snapshot={snapshot}
        currency={business.currency}
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Sales yesterday"
          value={formatCurrency(totals.salesYesterday, business.currency)}
          trendLabel={salesDeltaPct === null ? undefined : formatPercent(salesDeltaPct)}
          trendDirection={trendDirection(salesDeltaPct)}
          footnote={`Today so far: ${formatCurrency(totals.salesToday, business.currency)}`}
        />
        <KpiCard
          label="Expenses yesterday"
          value={formatCurrency(totals.expensesYesterday, business.currency)}
          trendLabel={expenseDeltaPct === null ? undefined : formatPercent(expenseDeltaPct)}
          trendDirection={trendDirection(expenseDeltaPct, true)}
        />
        <KpiCard
          label="Profit yesterday"
          value={formatCurrency(profitYesterday, business.currency)}
          footnote={`Week: ${formatCurrency(totals.profitThisWeek, business.currency)}`}
        />
        <KpiCard
          label="Health"
          value={snapshot.lowStock.length === 0 ? "Calm" : `${snapshot.lowStock.length} alert(s)`}
          footnote={
            snapshot.lowStock.length === 0
              ? "Inventory and finances look balanced."
              : "Inventory items need attention."
          }
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.45fr_1fr]">
        <SalesChart weekdayTotals={snapshot.weekdayTotals} />
        <InventoryAlertCard lowStock={snapshot.lowStock} />
      </section>

      <section>
        <h2 className="font-serif text-lg font-semibold text-navy-900">Recommendations for today</h2>
        <p className="mt-1 text-sm text-ink-soft">
          One growth idea, one way to save, and one heads-up. Pick one and act on it.
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {topGrowth && (
            <RecommendationCard
              type={topGrowth.type}
              title={topGrowth.title}
              description={topGrowth.description}
              impactLabel={topGrowth.impactLabel}
            />
          )}
          {topSavings && (
            <RecommendationCard
              type={topSavings.type}
              title={topSavings.title}
              description={topSavings.description}
              impactLabel={topSavings.impactLabel}
              actionLabel="Review"
            />
          )}
          {topRisk && (
            <RecommendationCard
              type={topRisk.type}
              title={topRisk.title}
              description={topRisk.description}
              impactLabel={topRisk.impactLabel}
              actionLabel="Reorder"
            />
          )}
          {!topGrowth && !topSavings && !topRisk && (
            <p className="rounded-lg border border-dashed border-line bg-white px-4 py-6 text-sm text-muted md:col-span-3">
              Nothing urgent today. Keep logging sales and expenses to unlock more recommendations.
            </p>
          )}
        </div>
      </section>

      <ActivityList recentSales={recentSales} recentExpenses={recentExpenses} currency={business.currency} />
    </>
  );
}

function pctDelta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

function trendDirection(value: number | null, invert = false): "up" | "down" | "flat" {
  if (value === null || Math.abs(value) < 0.5) return "flat";
  const isUp = value > 0;
  return invert ? (isUp ? "down" : "up") : isUp ? "up" : "down";
}

/** Crude proxies — full multi-day per-day data isn't needed for MVP KPIs. */
function twoDaysAgoTotal(totals: { salesThisWeek: number; salesYesterday: number; salesToday: number }) {
  return Math.max(0, (totals.salesThisWeek - totals.salesToday - totals.salesYesterday) / 5);
}
function twoDaysAgoExpense(totals: {
  expensesThisWeek: number;
  expensesYesterday: number;
  expensesToday: number;
}) {
  return Math.max(0, (totals.expensesThisWeek - totals.expensesToday - totals.expensesYesterday) / 5);
}

function prettyToday(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function buildSummary(
  currency: string,
  t: {
    salesYesterday: number;
    expensesYesterday: number;
    salesThisWeek: number;
    expensesThisWeek: number;
    profitThisWeek: number;
  },
  lowStockCount: number
): string {
  const profitYesterday = t.salesYesterday - t.expensesYesterday;
  const lowStockClause =
    lowStockCount > 0
      ? ` ${lowStockCount} inventory item(s) are low — that's the most pressing thing today.`
      : " Inventory looks healthy.";

  return (
    `Yesterday you took in ${formatCurrency(t.salesYesterday, currency)} and spent ${formatCurrency(
      t.expensesYesterday,
      currency
    )}, leaving ${formatCurrency(profitYesterday, currency)} in profit. ` +
    `This week so far: ${formatCurrency(t.salesThisWeek, currency)} in sales, ${formatCurrency(
      t.profitThisWeek,
      currency
    )} in profit.` +
    lowStockClause
  );
}

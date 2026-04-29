import { listSalesLastNDays } from "@/lib/services/sales";
import { listExpensesLastNDays } from "@/lib/services/expenses";
import { listInventory, selectLowStock } from "@/lib/services/inventory";
import { getLatestGizmoNormalized } from "@/lib/services/gizmo";
import { weekdayName } from "@/lib/utils/dates";
import type { GizmoNormalizedMetrics, InventoryItemRow } from "@/types/database";

/**
 * A read-only snapshot of a business' last 14 days, used as input by
 * both the recommendations engine and the AI assistant.
 *
 * Computing this in one place keeps the dashboard, /assistant, and
 * recommendations engine consistent — they all see the same numbers.
 */
export interface BusinessSnapshot {
  totals: {
    salesToday: number;
    salesYesterday: number;
    salesThisWeek: number;
    salesLastWeek: number;
    expensesToday: number;
    expensesYesterday: number;
    expensesThisWeek: number;
    expensesLastWeek: number;
    profitThisWeek: number;
  };
  weekdayTotals: Array<{ weekday: string; total: number }>;
  weakestWeekday: { weekday: string; total: number } | null;
  expensesByCategory: Array<{ category: string; thisWeek: number; lastWeek: number; deltaPct: number }>;
  inventory: InventoryItemRow[];
  lowStock: InventoryItemRow[];
  /** Latest Gizmo Web API snapshot (null if never synced). */
  gizmo: GizmoNormalizedMetrics | null;
}

const WEEKDAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

function sum(values: number[]): number {
  return values.reduce((acc, n) => acc + n, 0);
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

export async function buildBusinessSnapshot(businessId: string): Promise<BusinessSnapshot> {
  const [sales, expenses, inventory, gizmo] = await Promise.all([
    listSalesLastNDays(businessId, 14),
    listExpensesLastNDays(businessId, 14),
    listInventory(businessId),
    getLatestGizmoNormalized(businessId)
  ]);

  const todayIso = new Date().toISOString().slice(0, 10);
  const yesterdayIso = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 6 * 86_400_000).toISOString().slice(0, 10);
  const fourteenDaysAgo = new Date(Date.now() - 13 * 86_400_000).toISOString().slice(0, 10);

  const salesToday = sum(sales.filter((s) => s.sale_date === todayIso).map((s) => Number(s.amount)));
  const salesYesterday = sum(
    sales.filter((s) => s.sale_date === yesterdayIso).map((s) => Number(s.amount))
  );
  const salesThisWeek = sum(
    sales.filter((s) => s.sale_date >= sevenDaysAgo).map((s) => Number(s.amount))
  );
  const salesLastWeek = sum(
    sales
      .filter((s) => s.sale_date >= fourteenDaysAgo && s.sale_date < sevenDaysAgo)
      .map((s) => Number(s.amount))
  );

  const expensesToday = sum(
    expenses.filter((e) => e.expense_date === todayIso).map((e) => Number(e.amount))
  );
  const expensesYesterday = sum(
    expenses.filter((e) => e.expense_date === yesterdayIso).map((e) => Number(e.amount))
  );
  const expensesThisWeek = sum(
    expenses.filter((e) => e.expense_date >= sevenDaysAgo).map((e) => Number(e.amount))
  );
  const expensesLastWeek = sum(
    expenses
      .filter((e) => e.expense_date >= fourteenDaysAgo && e.expense_date < sevenDaysAgo)
      .map((e) => Number(e.amount))
  );

  const weekdayMap = new Map<string, number>();
  for (const s of sales.filter((s) => s.sale_date >= sevenDaysAgo)) {
    const weekday = weekdayName(s.sale_date);
    weekdayMap.set(weekday, (weekdayMap.get(weekday) ?? 0) + Number(s.amount));
  }
  const weekdayTotals = WEEKDAY_ORDER.map((weekday) => ({
    weekday,
    total: weekdayMap.get(weekday) ?? 0
  }));
  const weakestWeekday =
    weekdayTotals.filter((w) => w.total > 0).sort((a, b) => a.total - b.total)[0] ?? null;

  const categoryMap = new Map<string, { thisWeek: number; lastWeek: number }>();
  for (const e of expenses) {
    const category = e.category ?? "Uncategorized";
    const bucket = categoryMap.get(category) ?? { thisWeek: 0, lastWeek: 0 };
    if (e.expense_date >= sevenDaysAgo) bucket.thisWeek += Number(e.amount);
    else bucket.lastWeek += Number(e.amount);
    categoryMap.set(category, bucket);
  }
  const expensesByCategory = Array.from(categoryMap.entries()).map(([category, b]) => ({
    category,
    thisWeek: b.thisWeek,
    lastWeek: b.lastWeek,
    deltaPct: pctChange(b.thisWeek, b.lastWeek)
  }));

  return {
    totals: {
      salesToday,
      salesYesterday,
      salesThisWeek,
      salesLastWeek,
      expensesToday,
      expensesYesterday,
      expensesThisWeek,
      expensesLastWeek,
      profitThisWeek: salesThisWeek - expensesThisWeek
    },
    weekdayTotals,
    weakestWeekday,
    expensesByCategory,
    inventory,
    lowStock: selectLowStock(inventory),
    gizmo
  };
}

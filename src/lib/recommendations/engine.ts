import type { BusinessSnapshot } from "@/lib/services/business-snapshot";
import type { RecommendationType } from "@/types/database";

/**
 * MVP recommendations engine.
 *
 * Pure, deterministic, rule-based. Each rule receives a BusinessSnapshot and
 * may return zero or more `DraftRecommendation`s. The dashboard renders the
 * highest-priority growth, savings and risk items.
 *
 * No DB writes here. Persistence is the caller's responsibility.
 */

export interface DraftRecommendation {
  type: RecommendationType;
  title: string;
  description: string;
  impactLabel?: string;
  /** Higher = more important. Used to pick "the one" growth/savings/risk. */
  priority: number;
}

type Rule = (snapshot: BusinessSnapshot) => DraftRecommendation[];

const RULES: Rule[] = [
  ruleMondayPromo,
  ruleLowStockReorder,
  ruleRisingExpenseCategory,
  ruleQuietWeekday
];

export function generateRecommendations(snapshot: BusinessSnapshot): DraftRecommendation[] {
  return RULES.flatMap((rule) => rule(snapshot));
}

export function pickTopByType(
  drafts: DraftRecommendation[],
  type: RecommendationType
): DraftRecommendation | null {
  return (
    drafts
      .filter((d) => d.type === type)
      .sort((a, b) => b.priority - a.priority)[0] ?? null
  );
}

// ----------- rules -----------

function ruleMondayPromo(snapshot: BusinessSnapshot): DraftRecommendation[] {
  const monday = snapshot.weekdayTotals.find((w) => w.weekday === "Monday");
  const others = snapshot.weekdayTotals.filter((w) => w.weekday !== "Monday" && w.total > 0);
  if (!monday || monday.total === 0 || others.length === 0) return [];

  const avgOthers = others.reduce((acc, w) => acc + w.total, 0) / others.length;
  if (monday.total >= avgOthers * 0.7) return [];

  const liftEstimate = Math.round((avgOthers - monday.total) * 0.5);
  return [
    {
      type: "growth",
      title: "Run a Monday morning promo",
      description:
        "Mondays are noticeably slower than the rest of your week. A small coffee + pastry combo could nudge weekly sales up.",
      impactLabel: liftEstimate > 0 ? `Est. +$${liftEstimate} / wk` : undefined,
      priority: 80
    }
  ];
}

function ruleLowStockReorder(snapshot: BusinessSnapshot): DraftRecommendation[] {
  if (snapshot.lowStock.length === 0) return [];
  const names = snapshot.lowStock
    .slice(0, 3)
    .map((i) => i.name)
    .join(", ");

  return [
    {
      type: "risk",
      title: "Inventory will run thin",
      description: `${snapshot.lowStock.length} item(s) are at or below their reorder threshold (${names}). I can pre-fill a reorder draft.`,
      impactLabel: `${snapshot.lowStock.length} item(s) low`,
      priority: 100
    }
  ];
}

function ruleRisingExpenseCategory(snapshot: BusinessSnapshot): DraftRecommendation[] {
  const meaningful = snapshot.expensesByCategory
    .filter((c) => c.thisWeek >= 50 && c.deltaPct >= 25)
    .sort((a, b) => b.deltaPct - a.deltaPct);

  const top = meaningful[0];
  if (!top) return [];

  return [
    {
      type: "savings",
      title: `Costs in "${top.category}" are rising`,
      description: `This week you spent ${Math.round(top.deltaPct)}% more on ${top.category.toLowerCase()} than last week. Worth a quick supplier review.`,
      impactLabel: `+$${Math.round(top.thisWeek - top.lastWeek)} vs last week`,
      priority: 70
    }
  ];
}

function ruleQuietWeekday(snapshot: BusinessSnapshot): DraftRecommendation[] {
  if (!snapshot.weakestWeekday) return [];
  const { weekday, total } = snapshot.weakestWeekday;
  const avg =
    snapshot.weekdayTotals.filter((w) => w.total > 0).reduce((acc, w) => acc + w.total, 0) /
    Math.max(1, snapshot.weekdayTotals.filter((w) => w.total > 0).length);

  if (total >= avg * 0.5) return [];

  return [
    {
      type: "operations",
      title: `${weekday} is unusually quiet`,
      description: `Your ${weekday} sales are well below average. Consider a shorter shift or a targeted offer to lift the day.`,
      priority: 40
    }
  ];
}

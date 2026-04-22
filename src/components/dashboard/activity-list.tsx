import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";
import type { SaleRow, ExpenseRow } from "@/types/database";

interface ActivityListProps {
  recentSales: SaleRow[];
  recentExpenses: ExpenseRow[];
  currency: string;
}

interface FeedItem {
  id: string;
  kind: "sale" | "expense";
  date: string;
  primary: string;
  secondary: string;
}

function buildFeed(sales: SaleRow[], expenses: ExpenseRow[], currency: string): FeedItem[] {
  const items: FeedItem[] = [
    ...sales.map(
      (s): FeedItem => ({
        id: s.id,
        kind: "sale",
        date: s.created_at,
        primary: `Sale · ${formatCurrency(Number(s.amount), currency)}`,
        secondary: s.category ?? "Uncategorized"
      })
    ),
    ...expenses.map(
      (e): FeedItem => ({
        id: e.id,
        kind: "expense",
        date: e.created_at,
        primary: `Expense · ${formatCurrency(Number(e.amount), currency)}`,
        secondary: e.vendor_name ?? e.category ?? "Uncategorized"
      })
    )
  ];
  return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
}

export function ActivityList({ recentSales, recentExpenses, currency }: ActivityListProps) {
  const feed = buildFeed(recentSales, recentExpenses, currency);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Recent activity</CardTitle>
          <CardSubtitle>Latest entries across the business</CardSubtitle>
        </div>
      </CardHeader>
      <CardBody>
        {feed.length === 0 ? (
          <p className="text-sm text-muted">No activity yet. Add your first sale or expense.</p>
        ) : (
          <ul>
            {feed.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 border-b border-dashed border-line py-2.5 last:border-b-0"
              >
                <div className="flex items-center gap-2.5">
                  <Marker kind={item.kind} />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-navy-900">{item.primary}</span>
                    <span className="text-[11px] text-muted">{item.secondary}</span>
                  </div>
                </div>
                <time className="text-[11px] text-muted">{relativeTime(item.date)}</time>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

function Marker({ kind }: { kind: "sale" | "expense" }) {
  if (kind === "sale") {
    return (
      <span className="grid h-7 w-7 place-items-center rounded-md bg-good-soft text-xs font-bold text-good">
        $
      </span>
    );
  }
  return (
    <span className="grid h-7 w-7 place-items-center rounded-md bg-bad-soft text-xs font-bold text-bad">
      −
    </span>
  );
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
}

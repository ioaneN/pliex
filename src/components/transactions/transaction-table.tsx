import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";
import type { ExpenseRow, SaleRow } from "@/types/database";

type Row =
  | { kind: "sale"; id: string; date: string; amount: number; category: string | null; secondary: string | null }
  | { kind: "expense"; id: string; date: string; amount: number; category: string | null; secondary: string | null };

interface TransactionTableProps {
  title: string;
  subtitle?: string;
  sales?: SaleRow[];
  expenses?: ExpenseRow[];
  currency: string;
  emptyMessage: string;
}

export function TransactionTable({
  title,
  subtitle,
  sales = [],
  expenses = [],
  currency,
  emptyMessage
}: TransactionTableProps) {
  const rows: Row[] = [
    ...sales.map(
      (s): Row => ({
        kind: "sale",
        id: s.id,
        date: s.sale_date,
        amount: Number(s.amount),
        category: s.category,
        secondary: s.notes
      })
    ),
    ...expenses.map(
      (e): Row => ({
        kind: "expense",
        id: e.id,
        date: e.expense_date,
        amount: Number(e.amount),
        category: e.category,
        secondary: e.vendor_name ?? e.notes
      })
    )
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
        </div>
      </CardHeader>
      <CardBody>
        {rows.length === 0 ? (
          <p className="text-sm text-muted">{emptyMessage}</p>
        ) : (
          <div className="overflow-hidden rounded-md border border-line">
            <table className="w-full text-sm">
              <thead className="bg-paper-deep text-[11px] uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Category</th>
                  <th className="px-3 py-2 text-left">Detail</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-line-soft">
                    <td className="px-3 py-2 text-ink-soft">{r.date}</td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          r.kind === "sale"
                            ? "rounded-full bg-good-soft px-2 py-0.5 text-[11px] font-bold text-good"
                            : "rounded-full bg-bad-soft px-2 py-0.5 text-[11px] font-bold text-bad"
                        }
                      >
                        {r.kind === "sale" ? "Sale" : "Expense"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-ink-soft">{r.category ?? "—"}</td>
                    <td className="px-3 py-2 text-ink-soft">{r.secondary ?? "—"}</td>
                    <td className="px-3 py-2 text-right font-serif font-semibold text-navy-900">
                      {formatCurrency(r.amount, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

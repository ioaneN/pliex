import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from "@/components/ui/card";
import type { InventoryItemRow } from "@/types/database";

interface InventoryTableProps {
  items: InventoryItemRow[];
}

export function InventoryTable({ items }: InventoryTableProps) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>All inventory items</CardTitle>
          <CardSubtitle>Quantities and reorder thresholds</CardSubtitle>
        </div>
      </CardHeader>
      <CardBody>
        {items.length === 0 ? (
          <p className="text-sm text-muted">No inventory items yet.</p>
        ) : (
          <div className="overflow-hidden rounded-md border border-line">
            <table className="w-full text-sm">
              <thead className="bg-paper-deep text-[11px] uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-3 py-2 text-left">Item</th>
                  <th className="px-3 py-2 text-right">Quantity</th>
                  <th className="px-3 py-2 text-right">Reorder at</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const isLow = Number(item.quantity) <= Number(item.reorder_threshold);
                  return (
                    <tr key={item.id} className="border-t border-line-soft">
                      <td className="px-3 py-2 font-medium text-navy-900">{item.name}</td>
                      <td className="px-3 py-2 text-right font-serif font-semibold text-navy-900">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-3 py-2 text-right text-ink-soft">
                        {item.reorder_threshold} {item.unit}
                      </td>
                      <td className="px-3 py-2">
                        {isLow ? (
                          <span className="rounded-full bg-warn-soft px-2 py-0.5 text-[11px] font-bold text-warn">
                            Low
                          </span>
                        ) : (
                          <span className="rounded-full bg-good-soft px-2 py-0.5 text-[11px] font-bold text-good">
                            OK
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

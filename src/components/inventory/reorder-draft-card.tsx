import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ReorderLine } from "@/lib/automations/reorder-draft";

interface ReorderDraftCardProps {
  lines: ReorderLine[];
}

export function ReorderDraftCard({ lines }: ReorderDraftCardProps) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Reorder draft</CardTitle>
          <CardSubtitle>Suggested quantities to bring stock back to a safe level</CardSubtitle>
        </div>
        <Button size="sm" disabled={lines.length === 0}>
          Send to supplier
        </Button>
      </CardHeader>
      <CardBody>
        {lines.length === 0 ? (
          <p className="text-sm text-muted">Nothing to reorder right now. Inventory looks healthy.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {lines.map((line) => (
              <li
                key={line.itemId}
                className="flex items-center justify-between rounded-md border border-line px-3 py-2"
              >
                <span className="text-sm font-medium text-navy-900">{line.itemName}</span>
                <span className="font-serif text-sm font-semibold text-navy-700">
                  {line.suggestedQuantity} {line.unit}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { InventoryItemRow } from "@/types/database";

interface InventoryAlertCardProps {
  lowStock: InventoryItemRow[];
}

export function InventoryAlertCard({ lowStock }: InventoryAlertCardProps) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Inventory alerts</CardTitle>
          <CardSubtitle>Items at or below threshold</CardSubtitle>
        </div>
        <Link href="/inventory">
          <Button variant="link" size="sm">Manage →</Button>
        </Link>
      </CardHeader>
      <CardBody>
        {lowStock.length === 0 ? (
          <p className="text-sm text-muted">Inventory looks healthy. Nothing to reorder yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {lowStock.slice(0, 4).map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 rounded-md border border-warn-soft bg-warn-soft/40 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warn" />
                  <span className="text-sm font-medium text-navy-900">{item.name}</span>
                </div>
                <span className="font-serif text-sm font-semibold text-warn">
                  {item.quantity} {item.unit}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

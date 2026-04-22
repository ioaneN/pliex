import type { InventoryItemRow } from "@/types/database";

export interface ReorderLine {
  itemId: string;
  itemName: string;
  unit: string;
  suggestedQuantity: number;
}

/**
 * Builds a "what should I reorder?" draft from an inventory list.
 * Pure function — no DB writes. Suggests bringing each low item back to
 * 2x its reorder threshold.
 */
export function buildReorderDraft(items: InventoryItemRow[]): ReorderLine[] {
  return items
    .filter((i) => i.quantity <= i.reorder_threshold)
    .map((i) => ({
      itemId: i.id,
      itemName: i.name,
      unit: i.unit,
      suggestedQuantity: Math.max(1, Math.ceil(i.reorder_threshold * 2 - i.quantity))
    }));
}

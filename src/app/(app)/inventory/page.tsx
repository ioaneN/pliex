import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { ReorderDraftCard } from "@/components/inventory/reorder-draft-card";
import { getOwnedBusiness } from "@/lib/services/businesses";
import { listInventory, selectLowStock } from "@/lib/services/inventory";
import { buildReorderDraft } from "@/lib/automations/reorder-draft";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const business = await getOwnedBusiness();
  if (!business) redirect("/onboarding");

  const items = await listInventory(business.id);
  const lowStock = selectLowStock(items);
  const reorderLines = buildReorderDraft(items);

  return (
    <>
      <PageHeader
        eyebrow="What you have on hand"
        title="Inventory"
        subtitle="Watch quantities, set reorder thresholds, and let Pliex draft the next order."
      />

      <section className="grid gap-4 lg:grid-cols-[1.45fr_1fr]">
        <InventoryTable items={items} />
        <ReorderDraftCard lines={reorderLines} />
      </section>

      {lowStock.length > 0 && (
        <p className="rounded-md border border-warn/30 bg-warn-soft px-4 py-2 text-sm text-warn">
          {lowStock.length} item(s) are at or below their reorder threshold.
        </p>
      )}
    </>
  );
}

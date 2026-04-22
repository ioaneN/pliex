import "server-only";
import { getResendClient } from "@/lib/email/resend-client";
import { serverEnv } from "@/lib/utils/env";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import type { BusinessSnapshot } from "@/lib/services/business-snapshot";
import type { BusinessRow, UserRow } from "@/types/database";

export interface SendWeeklySummaryInput {
  business: BusinessRow;
  owner: Pick<UserRow, "email" | "full_name">;
  snapshot: BusinessSnapshot;
}

/**
 * Sends the Monday morning weekly summary.
 * Returns true on success; false (without throwing) if email is not configured.
 */
export async function sendWeeklySummaryEmail(input: SendWeeklySummaryInput): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) return false;

  const { error } = await resend.emails.send({
    from: serverEnv.resendFromEmail,
    to: input.owner.email,
    subject: `${input.business.name} — last week in one glance`,
    html: renderWeeklySummaryHtml(input)
  });

  if (error) throw new Error(error.message);
  return true;
}

function renderWeeklySummaryHtml({
  business,
  owner,
  snapshot
}: SendWeeklySummaryInput): string {
  const t = snapshot.totals;
  const salesDelta = t.salesLastWeek === 0 ? 0 : ((t.salesThisWeek - t.salesLastWeek) / t.salesLastWeek) * 100;
  const lowStockNames = snapshot.lowStock
    .slice(0, 3)
    .map((i) => i.name)
    .join(", ");

  const greetingName = owner.full_name?.split(" ")[0] ?? "there";

  return `
    <div style="font-family: 'Iowan Old Style', Georgia, serif; color: #0e2238; line-height: 1.55;">
      <p>Good morning, ${greetingName}.</p>
      <p>Here's how <strong>${business.name}</strong> looked last week:</p>
      <ul>
        <li><strong>Sales:</strong> ${formatCurrency(t.salesThisWeek, business.currency)} (${formatPercent(salesDelta)} vs week before)</li>
        <li><strong>Expenses:</strong> ${formatCurrency(t.expensesThisWeek, business.currency)}</li>
        <li><strong>Profit:</strong> ${formatCurrency(t.profitThisWeek, business.currency)}</li>
        ${snapshot.lowStock.length > 0 ? `<li><strong>Low stock:</strong> ${lowStockNames}</li>` : ""}
      </ul>
      <p>Open Pliex to see this morning's recommendations and one clear next action.</p>
    </div>
  `;
}

import { describe, expect, it } from "vitest";
import { parseSquarePaymentsToSales } from "@/lib/integrations/square/payments-to-sales";

describe("parseSquarePaymentsToSales", () => {
  it("maps completed Square payments into idempotent sales rows", () => {
    const rows = parseSquarePaymentsToSales([
      {
        id: "pay_1",
        status: "COMPLETED",
        created_at: "2026-05-06T08:10:00Z",
        amount_money: { amount: 1299 },
        order_id: "order_1"
      },
      {
        id: "pay_1",
        status: "COMPLETED",
        created_at: "2026-05-06T08:10:00Z",
        amount_money: { amount: 1299 }
      },
      {
        id: "pay_2",
        status: "APPROVED",
        amount_money: { amount: 500 }
      }
    ]);

    expect(rows).toEqual([
      {
        external_key: "square:payment:pay_1",
        amount: 12.99,
        sale_date: "2026-05-06",
        category: "POS (Square)",
        notes: "Order: order_1"
      }
    ]);
  });
});

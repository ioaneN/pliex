import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from "@/components/ui/card";
import { AddSaleForm } from "@/components/transactions/add-sale-form";
import { AddExpenseForm } from "@/components/transactions/add-expense-form";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { getOwnedBusiness } from "@/lib/services/businesses";
import { listRecentSales } from "@/lib/services/sales";
import { listRecentExpenses } from "@/lib/services/expenses";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const business = await getOwnedBusiness();
  if (!business) redirect("/onboarding");

  const [sales, expenses] = await Promise.all([
    listRecentSales(business.id, 30),
    listRecentExpenses(business.id, 30)
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Money in & out"
        title="Transactions"
        subtitle="Record sales and expenses by hand. Pliex auto-categorizes expenses when you leave the field blank."
      />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Add a sale</CardTitle>
            <CardSubtitle>Quick entry — saves immediately.</CardSubtitle>
          </div>
        </CardHeader>
        <CardBody>
          <AddSaleForm />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Add an expense</CardTitle>
            <CardSubtitle>Vendor + amount is enough — Pliex picks the category.</CardSubtitle>
          </div>
        </CardHeader>
        <CardBody>
          <AddExpenseForm />
        </CardBody>
      </Card>

      <TransactionTable
        title="Recent transactions"
        subtitle="Last 30 entries across sales and expenses."
        sales={sales}
        expenses={expenses}
        currency={business.currency}
        emptyMessage="No transactions yet. Add your first sale or expense above."
      />
    </>
  );
}

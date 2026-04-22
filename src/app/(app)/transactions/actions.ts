"use server";

import { revalidatePath } from "next/cache";
import { addExpenseSchema, addSaleSchema } from "@/lib/validation/schemas";
import { createSale } from "@/lib/services/sales";
import { createExpense } from "@/lib/services/expenses";
import { autoCategorizeExpense } from "@/lib/automations/expense-categorizer";
import { getOwnedBusiness } from "@/lib/services/businesses";

export interface TransactionFormState {
  fieldErrors: Partial<Record<string, string>>;
  formError?: string;
  ok?: boolean;
}

const EMPTY_STATE: TransactionFormState = { fieldErrors: {} };

export async function addSaleAction(
  _prev: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
  const parsed = addSaleSchema.safeParse({
    amount: formData.get("amount"),
    category: formData.get("category"),
    saleDate: formData.get("saleDate") || undefined,
    notes: formData.get("notes")
  });
  if (!parsed.success) {
    return { fieldErrors: flatten(parsed.error.flatten().fieldErrors) };
  }

  const business = await getOwnedBusiness();
  if (!business) return { ...EMPTY_STATE, formError: "No business found." };

  try {
    await createSale({
      businessId: business.id,
      amount: parsed.data.amount,
      category: parsed.data.category ?? undefined,
      saleDate: parsed.data.saleDate,
      notes: parsed.data.notes ?? undefined
    });
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    return { ...EMPTY_STATE, ok: true };
  } catch (err) {
    return { ...EMPTY_STATE, formError: err instanceof Error ? err.message : "Could not save sale." };
  }
}

export async function addExpenseAction(
  _prev: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
  const parsed = addExpenseSchema.safeParse({
    amount: formData.get("amount"),
    category: formData.get("category"),
    expenseDate: formData.get("expenseDate") || undefined,
    vendorName: formData.get("vendorName"),
    notes: formData.get("notes")
  });
  if (!parsed.success) {
    return { fieldErrors: flatten(parsed.error.flatten().fieldErrors) };
  }

  const business = await getOwnedBusiness();
  if (!business) return { ...EMPTY_STATE, formError: "No business found." };

  const finalCategory = parsed.data.category?.trim()
    ? parsed.data.category
    : autoCategorizeExpense(parsed.data.vendorName ?? undefined, parsed.data.notes ?? undefined);

  try {
    await createExpense({
      businessId: business.id,
      amount: parsed.data.amount,
      category: finalCategory,
      expenseDate: parsed.data.expenseDate,
      vendorName: parsed.data.vendorName ?? undefined,
      notes: parsed.data.notes ?? undefined
    });
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    return { ...EMPTY_STATE, ok: true };
  } catch (err) {
    return { ...EMPTY_STATE, formError: err instanceof Error ? err.message : "Could not save expense." };
  }
}

function flatten(errors: Record<string, string[] | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(errors)) {
    if (value && value.length > 0) out[key] = value[0];
  }
  return out;
}

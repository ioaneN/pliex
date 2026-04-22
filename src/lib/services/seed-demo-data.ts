import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { daysAgo } from "@/lib/utils/dates";
import type { BusinessType } from "@/types/database";

/**
 * Seed believable starter data for a brand-new business so the dashboard
 * never feels empty on first open.
 *
 * Idempotent: only seeds when each table is empty for the given business.
 */
export async function seedDemoDataForBusiness(businessId: string, businessType: BusinessType) {
  const supabase = createSupabaseServerClient();

  await Promise.all([
    seedSales(supabase, businessId, businessType),
    seedExpenses(supabase, businessId, businessType),
    seedInventory(supabase, businessId, businessType),
    seedAutomations(supabase, businessId)
  ]);
}

type Client = ReturnType<typeof createSupabaseServerClient>;

async function tableEmpty(supabase: Client, table: string, businessId: string) {
  const { count } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId);
  return (count ?? 0) === 0;
}

async function seedSales(supabase: Client, businessId: string, type: BusinessType) {
  if (!(await tableEmpty(supabase, "sales", businessId))) return;

  const dailyTotals = [240, 310, 540, 380, 420, 610, 290, 260, 340, 580, 410, 460, 640, 320];
  const categories = type === "bakery"
    ? ["Bread", "Pastries", "Cakes", "Coffee"]
    : type === "food_shop"
      ? ["Groceries", "Drinks", "Snacks"]
      : ["Coffee", "Tea", "Pastries", "Sandwiches"];

  const rows = dailyTotals.flatMap((dayTotal, dayIdx) => {
    const date = daysAgo(13 - dayIdx);
    return categories.map((category, catIdx) => ({
      business_id: businessId,
      amount: Math.round((dayTotal / categories.length) * (0.7 + ((catIdx + dayIdx) % 5) * 0.1)),
      category,
      sale_date: date,
      source: "manual" as const,
      notes: null
    }));
  });

  await supabase.from("sales").insert(rows);
}

async function seedExpenses(supabase: Client, businessId: string, type: BusinessType) {
  if (!(await tableEmpty(supabase, "expenses", businessId))) return;

  const baseExpenses = [
    { category: "Ingredients", vendor_name: "Mill & Co.",     amount: 86 },
    { category: "Ingredients", vendor_name: "Riverside Dairy", amount: 64 },
    { category: "Utilities",   vendor_name: "City Power",     amount: 120 },
    { category: "Packaging",   vendor_name: "PaperGoods Co.", amount: 42 },
    { category: "Payroll",     vendor_name: "Payroll Run",    amount: 480 },
    { category: "Marketing",   vendor_name: "Instagram Ads",  amount: 35 }
  ];
  if (type === "cafe") baseExpenses.push({ category: "Ingredients", vendor_name: "Beans Roasters", amount: 78 });

  const rows = baseExpenses.flatMap((e, idx) => [
    { ...e, business_id: businessId, expense_date: daysAgo(10 - (idx % 7)), source: "manual" as const, notes: null },
    { ...e, amount: e.amount + 8, business_id: businessId, expense_date: daysAgo(3 - (idx % 3)), source: "manual" as const, notes: null }
  ]);

  await supabase.from("expenses").insert(rows);
}

async function seedInventory(supabase: Client, businessId: string, type: BusinessType) {
  if (!(await tableEmpty(supabase, "inventory_items", businessId))) return;

  const items = type === "bakery"
    ? [
        { name: "Bread flour",    quantity: 2,  unit: "bags", reorder_threshold: 5 },
        { name: "Butter",         quantity: 4,  unit: "kg",   reorder_threshold: 6 },
        { name: "Sugar",          quantity: 14, unit: "kg",   reorder_threshold: 8 },
        { name: "Eggs",           quantity: 96, unit: "pcs",  reorder_threshold: 60 },
        { name: "Yeast",          quantity: 1,  unit: "kg",   reorder_threshold: 2 }
      ]
    : type === "food_shop"
      ? [
          { name: "Coffee beans", quantity: 9,  unit: "kg",   reorder_threshold: 5 },
          { name: "Bottled water",quantity: 24, unit: "btl",  reorder_threshold: 30 },
          { name: "Snacks",       quantity: 40, unit: "pcs",  reorder_threshold: 20 }
        ]
      : [
          { name: "Coffee beans", quantity: 9,  unit: "kg",   reorder_threshold: 5 },
          { name: "Milk",         quantity: 22, unit: "L",    reorder_threshold: 12 },
          { name: "Sugar",        quantity: 14, unit: "kg",   reorder_threshold: 6 },
          { name: "Cups",         quantity: 80, unit: "pcs",  reorder_threshold: 100 }
        ];

  await supabase
    .from("inventory_items")
    .insert(items.map((i) => ({ ...i, business_id: businessId })));
}

async function seedAutomations(supabase: Client, businessId: string) {
  if (!(await tableEmpty(supabase, "automations", businessId))) return;

  await supabase.from("automations").insert([
    {
      business_id: businessId,
      name: "Weekly summary email",
      description: "A short Monday morning email with last week's numbers.",
      is_enabled: true
    },
    {
      business_id: businessId,
      name: "Low-stock reorder draft",
      description: "Pliex drafts a reorder list when items hit their threshold.",
      is_enabled: true
    },
    {
      business_id: businessId,
      name: "Expense auto-categorization",
      description: "Pliex categorizes new expenses based on vendor and notes.",
      is_enabled: true
    }
  ]);
}

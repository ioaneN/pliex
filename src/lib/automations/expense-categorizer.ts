/**
 * Expense auto-categorization (rule-based for MVP).
 *
 * Pure function: takes a vendor name + free-form notes and returns the most
 * likely category. Used when the owner adds an expense without picking one.
 */

const CATEGORY_RULES: Array<{ category: string; keywords: RegExp }> = [
  { category: "Ingredients", keywords: /\b(flour|sugar|butter|milk|eggs|yeast|chocolate|coffee|beans|tea)\b/i },
  { category: "Suppliers",   keywords: /\b(mill|farm|wholesale|supplier|distributor|co\.|& co)\b/i },
  { category: "Utilities",   keywords: /\b(electric|electricity|gas|water|internet|wifi|phone)\b/i },
  { category: "Rent",        keywords: /\b(rent|lease|landlord)\b/i },
  { category: "Payroll",     keywords: /\b(payroll|salary|wages|staff|barista|baker)\b/i },
  { category: "Equipment",   keywords: /\b(oven|grinder|fridge|machine|repair|maintenance)\b/i },
  { category: "Marketing",   keywords: /\b(ads|advert|instagram|facebook|google ads|flyer)\b/i },
  { category: "Packaging",   keywords: /\b(cup|lid|napkin|bag|box|packaging)\b/i }
];

export function autoCategorizeExpense(vendorName?: string, notes?: string): string {
  const haystack = `${vendorName ?? ""} ${notes ?? ""}`.trim();
  if (haystack === "") return "Uncategorized";

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.test(haystack)) return rule.category;
  }
  return "Other";
}

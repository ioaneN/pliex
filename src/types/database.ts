/**
 * Strongly-typed mirror of the Postgres schema in
 * supabase/migrations/0001_initial_schema.sql.
 *
 * Keep this file in sync with the SQL whenever the schema changes.
 */

export type BusinessType = "cafe" | "bakery" | "food_shop";

export type TransactionSource = "manual" | "import" | "integration";

export type RecommendationType = "growth" | "savings" | "operations" | "risk";

export type RecommendationStatus = "open" | "accepted" | "dismissed";

export type ConversationRole = "user" | "assistant";

export interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface BusinessRow {
  id: string;
  owner_user_id: string;
  name: string;
  business_type: BusinessType;
  currency: string;
  created_at: string;
}

export interface SaleRow {
  id: string;
  business_id: string;
  amount: number;
  category: string | null;
  sale_date: string;
  notes: string | null;
  source: TransactionSource;
  created_at: string;
}

export interface ExpenseRow {
  id: string;
  business_id: string;
  amount: number;
  category: string | null;
  expense_date: string;
  vendor_name: string | null;
  notes: string | null;
  source: TransactionSource;
  created_at: string;
}

export interface InventoryItemRow {
  id: string;
  business_id: string;
  name: string;
  quantity: number;
  unit: string;
  reorder_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface RecommendationRow {
  id: string;
  business_id: string;
  type: RecommendationType;
  title: string;
  description: string;
  impact_label: string | null;
  status: RecommendationStatus;
  created_at: string;
}

export interface AutomationRow {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AiConversationRow {
  id: string;
  business_id: string;
  user_id: string;
  role: ConversationRole;
  message: string;
  created_at: string;
}

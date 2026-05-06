/**
 * Strongly-typed mirror of the Postgres schema in
 * supabase/migrations/0001_initial_schema.sql.
 *
 * Keep this file in sync with the SQL whenever the schema changes.
 */

export type BusinessType = "cafe" | "bakery" | "food_shop" | "internet_cafe";

export type PosSystem = "square";

export type TransactionSource = "manual" | "import" | "integration";

export type SubscriptionStatus =
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "paused";

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
  /** Present after POS integrations migration; null for legacy rows. */
  pos_system?: PosSystem | null;
  created_at: string;
}

export interface SquareConnectionRow {
  id: string;
  business_id: string;
  access_token: string | null;
  refresh_token: string | null;
  access_token_expires_at: string | null;
  merchant_id: string | null;
  location_id: string | null;
  environment: "production" | "sandbox";
  scope: string | null;
  webhook_subscription_id: string | null;
  connected_at: string | null;
  disconnected_at: string | null;
  last_sync_at: string | null;
  last_sync_status: "ok" | "error" | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export type SafeSquareConnection = Pick<
  SquareConnectionRow,
  | "id"
  | "business_id"
  | "merchant_id"
  | "location_id"
  | "environment"
  | "scope"
  | "connected_at"
  | "disconnected_at"
  | "last_sync_at"
  | "last_sync_status"
  | "last_error"
  | "created_at"
  | "updated_at"
>;

export interface SubscriptionRow {
  id: string;
  business_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  status: SubscriptionStatus;
  price_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface SaleRow {
  id: string;
  business_id: string;
  amount: number;
  category: string | null;
  sale_date: string;
  notes: string | null;
  source: TransactionSource;
  /** Set for POS sync rows; unique per business when present (migration 0004). */
  external_key: string | null;
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

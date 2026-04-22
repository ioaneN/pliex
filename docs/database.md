# Database

Pliex uses Supabase (Postgres). All tables live in the `public` schema.

## Tables

| Table              | Purpose                                            |
|--------------------|----------------------------------------------------|
| `users`            | Mirror of `auth.users`, populated by trigger       |
| `businesses`       | One row per owner (single-business MVP invariant)  |
| `sales`            | Manual / imported sales entries                    |
| `expenses`         | Manual / imported expense entries                  |
| `inventory_items`  | Item, quantity, unit, reorder threshold            |
| `recommendations`  | Persisted recommendations (open / accepted / dismissed) |
| `automations`      | The 3 MVP automations + on/off toggle              |
| `ai_conversations` | Per-message chat history                           |

Strict typing lives in `src/types/database.ts` and must be kept in sync
when changing the SQL.

### `businesses.business_type`

Constrained to `'cafe' | 'bakery' | 'food_shop'`.

### `recommendations.type`

Constrained to `'growth' | 'savings' | 'operations' | 'risk'`.

### `*.source` (sales/expenses)

Constrained to `'manual' | 'import' | 'integration'`. Today only `manual`
is written.

## Row Level Security

All eight tables have RLS enabled.

- **`users`** — a row is visible/updatable only to itself (`id = auth.uid()`).
- **`businesses`** — owner-only (`owner_user_id = auth.uid()`).
- **All other owner-scoped tables** — gated by
  `is_business_owner(business_id)` which checks `businesses.owner_user_id =
  auth.uid()`.

This means:

- The application never has to filter by `owner_user_id` in queries — RLS
  filters automatically.
- A bug that forgets `.eq("business_id", ...)` cannot leak data; RLS still
  blocks reads/writes of unrelated rows.

## Triggers

| Trigger                     | When                                          | Effect                                                |
|-----------------------------|-----------------------------------------------|-------------------------------------------------------|
| `trg_on_auth_user_created`  | After insert on `auth.users`                  | Mirrors row into `public.users`                       |
| `trg_inventory_updated_at`  | Before update on `inventory_items`            | Sets `updated_at = now()`                             |
| `trg_automations_updated_at`| Before update on `automations`                | Sets `updated_at = now()`                             |

## Seeding

The MVP does not have global seed SQL because data is per-business. The
`seedDemoDataForBusiness(businessId, businessType)` function in
`lib/services/seed-demo-data.ts` seeds:

- 14 days of plausible sales across category-appropriate items.
- ~12 expense rows across `Ingredients`, `Utilities`, `Payroll`, `Packaging`,
  and `Marketing`.
- Inventory items appropriate for the business type — including 1–2 items
  intentionally below threshold so the dashboard surfaces alerts immediately.
- The 3 default automations, all enabled.

The function is idempotent: it only writes when the table is empty for the
business.

## Migrations

| File                                       | Description                       |
|--------------------------------------------|-----------------------------------|
| `supabase/migrations/0001_initial_schema.sql` | Tables, indexes, triggers      |
| `supabase/migrations/0002_row_level_security.sql` | RLS + policies + helper FN |

Apply them in order via the Supabase SQL editor or the Supabase CLI.

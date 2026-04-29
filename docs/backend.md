# Backend

The backend is composed of:

1. **Service layer** (`src/lib/services/*`) — owner-scoped data access on top
   of Supabase. RLS does the security; services do the shape.
2. **Pure domain logic** (`src/lib/recommendations`, `src/lib/automations`)
   — no I/O, fully unit-testable.
3. **Integration boundaries** (`src/lib/ai`, `src/lib/email`,
   `src/lib/integrations/*`) — thin adapters around OpenAI, Resend, and
   optional POS HTTP APIs.
4. **Server Actions** (`src/app/.../actions.ts`) and **route handlers**
   (`src/app/api/*`) — orchestration only.

## Services

| File                              | Exports                                                          |
|-----------------------------------|------------------------------------------------------------------|
| `services/businesses.ts`          | `getOwnedBusiness`, `createBusiness`                             |
| `services/sales.ts`               | `createSale`, `listRecentSales`, `listSalesLastNDays`            |
| `services/expenses.ts`            | `createExpense`, `listRecentExpenses`, `listExpensesLastNDays`   |
| `services/inventory.ts`           | `listInventory`, `selectLowStock`                                |
| `services/recommendations.ts`     | `listOpenRecommendations`                                        |
| `services/automations.ts`         | `listAutomations`, `setAutomationEnabled`                        |
| `services/conversation.ts`        | `listRecentConversation`, `appendMessage`                        |
| `services/business-snapshot.ts`   | `buildBusinessSnapshot` — single source of truth read for AI/UI  |
| `services/gizmo.ts`               | Gizmo connection, sync, snapshots, **`applyGizmoInvoicesToSales`** upsert |
| `services/seed-demo-data.ts`      | `seedDemoDataForBusiness` (idempotent)                           |

Every service uses `createSupabaseServerClient()`, which carries the user
session cookie. Combined with RLS, this means a service call cannot read or
write rows belonging to another business.

## Domain logic (pure)

### Recommendations engine — `lib/recommendations/engine.ts`

Rules implemented:

| Rule                          | Type        | Trigger                                                  |
|-------------------------------|-------------|----------------------------------------------------------|
| Monday morning promo          | growth      | Monday sales < 70% of average other-day sales            |
| Inventory will run thin       | risk        | Any item at or below `reorder_threshold`                 |
| Rising expense category       | savings     | Category up ≥ 25% week-over-week (and ≥ $50 spend)       |
| Quiet weekday                 | operations  | Weakest weekday < 50% of weekday average                 |

`pickTopByType(drafts, type)` picks the highest-priority draft per type so
the dashboard never shows two competing growth ideas.

### Automations — `lib/automations/`

| File                          | Pure?  | Purpose                                                   |
|-------------------------------|--------|-----------------------------------------------------------|
| `expense-categorizer.ts`      | yes    | Keyword → category fallback when owner leaves it blank    |
| `reorder-draft.ts`            | yes    | Build a reorder line list from an inventory snapshot      |
| `weekly-summary.ts`           | side-effect | Render + send weekly email via Resend (module ready; scheduler route deferred) |

## Integrations

### POS (Gizmo) — `lib/integrations/gizmo/` + `lib/services/gizmo.ts`

HTTP client and normalization for the venue’s Web API (when the owner
configures a public URL under **Integrations**). See
[`docs/features/integrations.md`](features/integrations.md).

### OpenAI — `lib/ai/`

`openai-client.ts` returns a singleton `OpenAI` instance, or `null` when no
API key is configured. `assistant.ts` wraps the chat-completions call with:

- A strict, plain-spoken system prompt.
- A second system message containing the JSON snapshot (grounding).
- The conversation history.
- A deterministic local fallback if the client is `null` or returns empty.

### Resend — `lib/email/`

`resend-client.ts` mirrors the OpenAI pattern. The weekly summary renders
its HTML inline so we don't ship an extra templating dependency.

## Configuration

`lib/utils/env.ts` is the only place that reads `process.env.*`. It
exports two frozen objects:

- `publicEnv` — values safe for the browser bundle (Supabase URL + anon key,
  site URL).
- `serverEnv` — server-only secrets (service role, OpenAI, Resend,
  optional `CRON_SECRET` for secured cron routes).

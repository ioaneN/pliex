# Investor & client demo — Pliex (internet café MVP)

One-page brief: what to show, what is real today, and what to say honestly.

## Elevator pitch

Pliex is an **owner workspace for internet cafés**: sales, expenses, inventory,
calm dashboards, rule-based recommendations, and an **AI assistant** that only
answers from **your** numbers — not generic chat. Optional **POS sync** (Square
today) pushes payments into the same **`sales`** table so the dashboard and AI
tell **one** financial story.

## Happy-path demo (5–8 minutes)

1. **Landing** (`/`) — internet-café positioning; no vendor lock-in on the home page.
2. **Sign in** — Google OAuth only (`/sign-in`).
3. **Onboarding** — business name + currency; type is **internet café**; sample
   data seeds automatically.
4. **Billing** — Stripe Checkout activates the workspace; Customer Portal manages payment method and cancellation.
5. **Dashboard** — KPIs, chart, recommendations, activity (all from Postgres).
6. **AI Assistant** — `/assistant` or FAB: ask *“How were sales this week?”* —
   answer matches the dashboard (shared `BusinessSnapshot`).
7. **Integrations → Square** (`/integrations/square`):
   - Click **Connect with Square** and approve OAuth.
   - Run **Refresh from Square**.
8. **Dashboard again** — after sync, **sales KPIs and chart** include POS
   payments (`source = integration`, `external_key = square:payment:…`).

## What is “real” in this build

| Capability | Status |
|------------|--------|
| Auth, single business per owner, RLS | Production-style |
| Manual sales / expenses / inventory | Full CRUD paths in app |
| Dashboard + recommendations + AI grounding | Same snapshot source |
| Stripe subscriptions + Customer Portal | Implemented |
| Subscription entitlement gates | Implemented |
| Square OAuth + encrypted token storage | Implemented |
| Square payments → `sales` upsert | Implemented (`0004` + `0005` migrations required) |
| Weekly summary email module | Implemented, but scheduler route is deferred |
| Square refunds/orders deep mapping | **Not** in this MVP |

## Environment checklist (demo host)

- `NEXT_PUBLIC_SITE_URL`, Supabase URL + anon key, `OPENAI_API_KEY`
- Stripe keys + webhook secret + recurring price id
- Square OAuth app id/secret + redirect URL
- `APP_ENCRYPTION_KEY` and `CRON_SECRET`
- Apply SQL migrations **through `0005`** on the Supabase project

## Honest talking points

- **Seed + POS:** first-time users get **demo** `sales` rows; after Square sync,
  totals combine **manual seed + POS** until you clear seed data or use a
  fresh account for a “pure POS” story.
- **Sync shape:** this MVP imports completed payments only (not full catalog,
  refunds, or item-level COGS).
- **Security:** Square OAuth tokens are encrypted before storage; Stripe and Square secrets live only server-side.
- **Billing:** Stripe is live-capable once webhook endpoints, price ids, and portal settings are configured.

## Related docs

- [Onboarding](features/onboarding.md)
- [Integrations / Square](features/integrations.md)
- [Database](database.md)
- [API routes](api.md)
- [Deployment](deployment.md)

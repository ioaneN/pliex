# Investor & client demo — Pliex (internet café MVP)

One-page brief: what to show, what is real today, and what to say honestly.

## Elevator pitch

Pliex is an **owner workspace for internet cafés**: sales, expenses, inventory,
calm dashboards, rule-based recommendations, and an **AI assistant** that only
answers from **your** numbers — not generic chat. Optional **POS sync** (Gizmo
today) pushes invoices into the same **`sales`** table so the dashboard and AI
tell **one** financial story.

## Happy-path demo (5–8 minutes)

1. **Landing** (`/`) — internet-café positioning; no vendor lock-in on the home page.
2. **Sign in** — Google OAuth only (`/sign-in`).
3. **Onboarding** — business name + currency; type is **internet café**; sample
   data seeds automatically.
4. **Dashboard** — KPIs, chart, recommendations, activity (all from Postgres).
5. **AI Assistant** — `/assistant` or FAB: ask *“How were sales this week?”* —
   answer matches the dashboard (shared `BusinessSnapshot`).
6. **Integrations → Gizmo** (`/integrations/gizmo`) — optional if you have a tunnel:
   - Venue enables **Web portal / HTTP API** (per Gizmo docs).
   - Public **HTTPS** URL (e.g. Cloudflare Tunnel) + operator login.
   - **Save & test connection**, then **Refresh from Gizmo**.
7. **Dashboard again** — after sync, **sales KPIs and chart** include POS
   invoices (`source = integration`, `external_key = gizmo:invoice:…`); the
   **Gizmo strip** still shows host / snapshot metrics.

## What is “real” in this build

| Capability | Status |
|------------|--------|
| Auth, single business per owner, RLS | Production-style |
| Manual sales / expenses / inventory | Full CRUD paths in app |
| Dashboard + recommendations + AI grounding | Same snapshot source |
| Gizmo connect + sync + snapshots | Implemented |
| Gizmo invoices → `sales` upsert | Implemented (`0004` migration required) |
| Weekly summary email module | Implemented, but scheduler route is deferred |
| Gizmo → `expenses` or full inventory mirror | **Not** in this MVP |
| Payments / subscriptions | Deferred (planned after first-customer validation) |
| Credential encryption / snapshot TTL | Roadmap |

## Environment checklist (demo host)

- `NEXT_PUBLIC_SITE_URL`, Supabase URL + anon key, `OPENAI_API_KEY`
- Apply SQL migrations **through `0004`** on the Supabase project
- For **cron** multi-tenant sync: `SUPABASE_SERVICE_ROLE_KEY` + `CRON_SECRET`
  (optional for a live demo if you only use **Refresh from Gizmo**)

## Honest talking points

- **Seed + POS:** first-time users get **demo** `sales` rows; after Gizmo sync,
  totals combine **manual seed + POS** until you clear seed data or use a
  fresh account for a “pure POS” story.
- **Invoice shape:** parsing uses flexible field names; if a venue’s API
  differs, mapping can be tightened without changing the product architecture.
- **Security:** operator credentials are RLS-protected but stored in Postgres;
  recommend a **dedicated** low-privilege operator for production.
- **Billing:** this MVP is intentionally payment-free while validating usage
  with first customers.

## Related docs

- [Onboarding](features/onboarding.md)
- [Integrations / Gizmo](features/integrations.md)
- [Database](database.md)
- [API routes](api.md)
- [Deployment](deployment.md)

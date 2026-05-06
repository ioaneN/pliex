# Changelog

## Unreleased

### Added
- **Paid SaaS v1:** Stripe Checkout, Customer Portal, webhook subscription
  handling, entitlement gating, `/billing`, and billing status in Settings.
- **Square OAuth:** Connect with Square, encrypted token storage, refresh
  before sync, disconnect, and hourly reconciliation cron.
- **Customer-readiness:** Terms/Privacy starter pages, CI workflow, Vitest
  tests for billing entitlement, Stripe mapping, and Square payment mapping.
- **Square → `sales` ledger:** migration `0004_sales_external_key.sql`;
  successful payment sync upserts `sales` rows (`source=integration`,
  `external_key`) so dashboard and AI match POS totals (`payments-to-sales.ts`).
- **Investor / client demo doc:** [`docs/demo-investor.md`](demo-investor.md).
- **Internet café MVP:** onboarding creates `businesses.business_type =
  'internet_cafe'` with optional `pos_system = 'square'`; seed data and copy
  target LAN-style venues. Marketing home positions Pliex for **all internet
  cafés** (POS-agnostic messaging).
- **Square integration (manual sync):** `square_connections`,
  `/integrations/square` UI, sync API routes
  (`docs/features/integrations.md`, `docs/api.md`, migration `0003_internet_cafe_square.sql`).
- **Responsive app shell** (`layout/app-shell.tsx`): below `md`, the sidebar
  is off-canvas behind a backdrop with a top-bar **menu** control; a
  **sparkle FAB** opens the assistant in a **slide-over** sheet. From `md`
  up, the same FAB opens a **docked** third column; the assistant stays
  **closed until opened**; the dock is omitted on `/assistant` to avoid
  duplicate chat. Narrowing the viewport closes the assistant; widening does
  not auto-open it.
- **`GET /api/assistant`** — returns recent `{ messages }` for bootstrapping
  the dock/sheet (`docs/api.md`).

### Fixed
- OAuth callback (`src/app/auth/callback/route.ts`) now anchors all
  post-sign-in redirects to `publicEnv.siteUrl` instead of `request.url`.
  Behind nginx, `request.url` could resolve to the bound interface
  (`http://localhost:3000`), which sent authenticated users to a dead
  address after Google sign-in.

### Changed
- `.env.example` no longer ships a `localhost:3000` default for
  `NEXT_PUBLIC_SITE_URL`. Each environment must set this explicitly so
  the value baked into the client bundle matches the deployment host.

## 0.1.0 — MVP scaffold

Initial production-style MVP build.

### Added
- Next.js (App Router) + TypeScript scaffolding.
- Tailwind design system based on the original prototype:
  nostalgic blue palette, warm cream paper background, brass accent.
- Supabase clients for browser, server, and middleware contexts.
- Google-only auth flow: `/sign-in`, `/auth/callback`, `/auth/sign-out`,
  edge middleware route protection.
- Database migrations:
  - `0001_initial_schema.sql` — 8 tables, indexes, triggers, auth-user
    mirror.
  - `0002_row_level_security.sql` — RLS on every table; owner-scoped via
    the `is_business_owner()` helper.
- Onboarding flow at `/onboarding` collecting business name, type,
  currency, and how the owner currently tracks sales/expenses; seeds
  believable demo data on completion.
- Dashboard at `/dashboard`:
  - Yesterday's sales/expenses/profit KPIs + business health
  - One-paragraph "Today, in one paragraph" summary
  - 7-day weekday SVG chart
  - Inventory alerts surface
  - Top growth / savings / risk recommendations from the engine
  - Mixed sales+expenses recent activity feed
- Transactions page at `/transactions`:
  - Inline server-action forms for sales and expenses
  - Auto-categorization fallback for blank expense categories
  - Recent transactions table
- Inventory page at `/inventory`:
  - Quantity / threshold / status table
  - Reorder draft with suggested quantities
- Assistant page at `/assistant`:
  - Persistent chat history
  - Quick prompt chips
  - `/api/assistant` endpoint grounded in the business snapshot
- Recommendations engine (`lib/recommendations/engine.ts`) with four pure
  rules: Monday promo, low-stock reorder, rising expense category, quiet
  weekday.
- Three automation modules: weekly summary email renderer/sender (Resend,
  route scheduling deferred), low-stock reorder draft (pure), expense
  auto-categorization (pure).
- AI integration (`lib/ai/`) with deterministic local fallback when no
  OpenAI key is configured.
- Marketing landing site at `/`: hero, features, how-it-works, why-pliex,
  CTA.
- Empty / loading / error states throughout.
- Documentation set: README, architecture, frontend, backend, database,
  auth, api, deployment, plus per-feature and decision docs.

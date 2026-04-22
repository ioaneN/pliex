# Pliex

> The AI operating layer for cafés, bakeries, and small food businesses.
> Sales, expenses, stock, and your next action — in one calm workspace.

Pliex is a focused, single-owner MVP. Every morning the owner signs in with
Google and immediately sees yesterday's sales, expenses, profit, low-stock
alerts, one growth recommendation, one savings recommendation, and one clear
next action.

## Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS, shadcn-style component primitives
- **Auth & DB:** Supabase (Postgres + Google OAuth only)
- **AI:** OpenAI API (`gpt-4o-mini` by default), grounded in a deterministic snapshot
- **Email:** Resend (weekly summary)
- **Hosting:** Vercel

## Run locally

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# OPENAI_API_KEY (optional in dev), RESEND_API_KEY (optional in dev)

# 3. Apply database migrations
# In the Supabase SQL editor, run, in order:
#   supabase/migrations/0001_initial_schema.sql
#   supabase/migrations/0002_row_level_security.sql

# 4. Configure Google OAuth in Supabase
# Authentication → Providers → Google → enable, paste OAuth client ID/secret
# Add http://localhost:3000/auth/callback to allowed redirects

# 5. Start the dev server
npm run dev
```

Open http://localhost:3000.

## Project layout

```
src/
  app/
    (marketing)/              public landing site
    (auth)/                   sign-in + onboarding
    (app)/                    authenticated workspace (dashboard, transactions, inventory, assistant)
    api/                      route handlers (assistant, health)
    auth/                     Supabase OAuth + sign-out routes
  components/
    ui/                       button, card, input, badge, brand mark, eyebrow
    layout/                   sidebar, topbar, app-shell, page-header
    landing/                  marketing sections
    onboarding/               business setup form
    dashboard/                kpi card, summary, chart, recommendation card, activity, inventory alerts
    transactions/             add sale + add expense forms, transaction table
    inventory/                inventory table, reorder draft card
    assistant/                chat surface, quick prompts
  lib/
    supabase/                 browser/server/middleware clients + auth helpers
    services/                 owner-scoped data access + business snapshot
    recommendations/          rule-based recommendations engine
    automations/              weekly summary, low-stock reorder draft, expense categorizer
    ai/                       OpenAI client + grounded assistant
    email/                    Resend client
    validation/               zod schemas
    utils/                    cn, dates, format, env
  types/
    database.ts               typed mirror of the SQL schema
supabase/
  migrations/                 SQL migrations
docs/                         architecture, frontend, backend, database, auth, api, deployment, changelog
prototypes/                   original HTML/CSS prototypes (design references only)
```

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — high-level system design
- [`docs/frontend.md`](docs/frontend.md) — frontend conventions and component map
- [`docs/backend.md`](docs/backend.md) — service layer, API, integrations
- [`docs/database.md`](docs/database.md) — schema, RLS, seed data
- [`docs/auth.md`](docs/auth.md) — Google auth flow + route protection
- [`docs/api.md`](docs/api.md) — route handlers
- [`docs/deployment.md`](docs/deployment.md) — Vercel + Supabase setup
- [`docs/changelog.md`](docs/changelog.md) — what shipped when
- [`docs/features/`](docs/features/) — per-feature notes
- [`docs/decisions/`](docs/decisions/) — architectural decision records

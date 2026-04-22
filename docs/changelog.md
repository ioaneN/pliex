# Changelog

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
- Three automations: weekly summary email (Resend), low-stock reorder
  draft (pure), expense auto-categorization (pure).
- AI integration (`lib/ai/`) with deterministic local fallback when no
  OpenAI key is configured.
- Marketing landing site at `/`: hero, features, how-it-works, why-pliex,
  CTA.
- Empty / loading / error states throughout.
- Documentation set: README, architecture, frontend, backend, database,
  auth, api, deployment, plus per-feature and decision docs.

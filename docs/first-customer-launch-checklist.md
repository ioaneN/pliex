# First-customer launch checklist

Use this checklist before onboarding a real pilot customer.

## 1) Build and code-health gate

- [x] `npm run typecheck` passes.
- [x] `npm run lint` passes.
- [x] `npm run test` passes.
- [x] `npm run build` passes and includes expected routes:
  - `/dashboard`, `/transactions`, `/inventory`, `/assistant`, `/integrations/square`, `/billing`
  - `/settings`, `/help` (no dead sidebar links)

## 2) Route and middleware smoke gate

Local HTTP checks (dev server) confirm expected behavior:

- [x] Public pages return `200`: `/`, `/sign-in`
- [x] Health endpoint returns `200`: `/api/health`
- [x] Authenticated pages redirect when signed out (`307` -> `/sign-in?redirect=...`):
  `/dashboard`, `/transactions`, `/inventory`, `/assistant`, `/integrations/square`, `/settings`, `/help`

## 3) Core user journey gate (manual)

Run this once with a fresh account, then once with a returning account:

1. Sign in with Google and confirm redirect to `/onboarding` (new user).
2. Complete onboarding and confirm redirect to `/dashboard`.
3. Confirm inactive billing redirects to `/billing`; complete Stripe Checkout with a test card.
4. Add one sale and one expense on `/transactions`; verify both appear in:
   - recent transactions table
   - dashboard activity list and KPI impact
5. Update one inventory item and confirm low-stock behavior on `/inventory` and `/dashboard`.
6. Ask assistant:
   - "How were sales this week?"
   - "What should I reorder?"
   Confirm answer is grounded and non-empty.
7. Open `/settings` and `/help` from sidebar; confirm both load without errors.
8. Connect Square with OAuth and run Refresh; confirm message feedback and transaction imports.

## 4) Ops readiness gate

- [x] Migrations present through `0005_paid_saas_v1.sql`.
- [x] Stripe webhook endpoint configured and receiving `checkout.session.completed`.
- [x] Square OAuth redirect URL configured.
- [x] `APP_ENCRYPTION_KEY` and `CRON_SECRET` configured.
- [x] Deployment doc lists required env vars and migration order.

## 5) Scope and messaging gate

- [x] Landing copy no longer implies weekly summary scheduling is already live.
- [x] Demo doc explicitly marks payments/subscriptions as deferred.
- [x] Weekly summary is documented as module-ready with scheduler deferred.

## Go / No-go rule

Go live for first customer only when sections 1-5 are fully checked for your
target environment.

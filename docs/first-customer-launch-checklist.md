# First-customer launch checklist

Use this checklist before onboarding a real pilot customer.

## 1) Build and code-health gate

- [x] `npm run typecheck` passes.
- [x] `npm run lint` passes.
- [x] `npm run build` passes and includes expected routes:
  - `/dashboard`, `/transactions`, `/inventory`, `/assistant`, `/integrations/gizmo`
  - `/settings`, `/help` (no dead sidebar links)

## 2) Route and middleware smoke gate

Local HTTP checks (dev server) confirm expected behavior:

- [x] Public pages return `200`: `/`, `/sign-in`
- [x] Health endpoint returns `200`: `/api/health`
- [x] Authenticated pages redirect when signed out (`307` -> `/sign-in?redirect=...`):
  `/dashboard`, `/transactions`, `/inventory`, `/assistant`, `/integrations/gizmo`, `/settings`, `/help`

## 3) Core user journey gate (manual)

Run this once with a fresh account, then once with a returning account:

1. Sign in with Google and confirm redirect to `/onboarding` (new user).
2. Complete onboarding and confirm redirect to `/dashboard`.
3. Add one sale and one expense on `/transactions`; verify both appear in:
   - recent transactions table
   - dashboard activity list and KPI impact
4. Update one inventory item and confirm low-stock behavior on `/inventory` and `/dashboard`.
5. Ask assistant:
   - "How were sales this week?"
   - "What should I reorder?"
   Confirm answer is grounded and non-empty.
6. Open `/settings` and `/help` from sidebar; confirm both load without errors.
7. (Optional) Connect Gizmo and run Refresh; confirm message feedback and dashboard strip updates.

## 4) Ops readiness gate

- [x] Migrations present through `0004_sales_external_key.sql`.
- [x] `vercel.json` cron path matches `/api/cron/gizmo-sync`.
- [x] Cron route checks `Authorization: Bearer CRON_SECRET`.
- [x] Deployment doc lists required env vars and migration order.

## 5) Scope and messaging gate

- [x] Landing copy no longer implies weekly summary scheduling is already live.
- [x] Demo doc explicitly marks payments/subscriptions as deferred.
- [x] Weekly summary is documented as module-ready with scheduler deferred.

## Go / No-go rule

Go live for first customer only when sections 1-5 are fully checked for your
target environment.

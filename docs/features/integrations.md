# Feature: POS integrations (MVP)

Optional wiring from the owner’s POS into Pliex so dashboards and AI use
live transactions alongside manual rows.

## Current scope

- **Supported vertical:** onboarding is **internet café** only (`businesses.business_type = 'internet_cafe'`).
- **Supported POS in app:** `businesses.pos_system` is **`square`** for new onboarding rows.
- **Connection storage:** owner-scoped OAuth metadata + encrypted tokens live in **`square_connections`**.
- **Ledger merge:** Completed Square payments are **upserted into `sales`** with
  `source = 'integration'` and **`external_key`** like
  `square:payment:<id>`. Re-sync updates the same
  rows so dashboard KPIs, charts, activity, recommendations, and the AI all
  read **one** sales ledger (alongside any original **manual** seed rows).
  Parser: `src/lib/integrations/square/payments-to-sales.ts`. Apply step:
  `applySquarePaymentsToSales` in `src/lib/services/square.ts`.

**Demo note:** If you still have onboarding **seed** sales in `sales`, totals
will combine seed + POS until you clear manual rows or start from a fresh
business.

## Owner flow

1. Complete onboarding (sample data is seeded for the café).
2. Open **Integrations → Square** (`/integrations/square`).
3. Click **Connect with Square**, approve Pliex in Square OAuth, and return to Pliex.
4. Use **Refresh from Square** manually; hourly reconciliation also runs through `/api/cron/square-sync`.

## Security notes

- OAuth tokens are encrypted before storage and are never sent back to the browser.
- Manual sync runs as the signed-in owner; scheduled sync uses the service role and remains idempotent via `external_key`.

## Files

| Area            | Path |
|-----------------|------|
| HTTP client     | `src/lib/integrations/square/client.ts` |
| OAuth helpers   | `src/lib/integrations/square/oauth.ts` |
| Payments → sales | `src/lib/integrations/square/payments-to-sales.ts` |
| Persistence     | `src/lib/services/square.ts` |
| UI              | `src/app/(app)/integrations/square/page.tsx`, `src/components/integrations/square-connect-form.tsx` |

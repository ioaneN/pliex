# Feature: POS integrations (MVP)

Optional wiring from the owner’s venue into Pliex so dashboards and the AI
can include live operational data alongside manual `sales` / `inventory`
rows.

## Current scope

- **Supported vertical:** onboarding is **internet café** only (`businesses.business_type = 'internet_cafe'`).
- **Supported POS in app:** `businesses.pos_system` may be set to **`gizmo`** at signup; connection details live in **`gizmo_connections`**.
- **Sync:** Server-side HTTP pulls (see `src/lib/integrations/gizmo/`) store normalized + raw payloads in **`gizmo_sync_snapshots`**. `buildBusinessSnapshot()` merges the latest normalized block into `snapshot.gizmo` (or `null`).
- **Ledger merge:** When the invoice endpoint returns **HTTP 2xx**, parsed
  invoices are **upserted into `sales`** with `source = 'integration'` and
  **`external_key`** like `gizmo:invoice:<id>`. Re-sync updates the same
  rows so dashboard KPIs, charts, activity, recommendations, and the AI all
  read **one** sales ledger (alongside any original **manual** seed rows).
  Parser: `src/lib/integrations/gizmo/invoice-to-sales.ts`. Apply step:
  `applyGizmoInvoicesToSales` in `src/lib/services/gizmo.ts`.

**Demo note:** If you still have onboarding **seed** sales in `sales`, totals
will combine seed + POS until you clear manual rows or start from a fresh
business.

## Owner flow

1. Complete onboarding (sample data is seeded for the café).
2. Open **Integrations → Gizmo** (`/integrations/gizmo`).
3. Enable the venue’s **web portal / HTTP API** (per venue software docs), expose it with a **public HTTPS URL** (e.g. tunnel), paste base URL + operator credentials, **Save & test connection**.
4. Use **Refresh from Gizmo** or rely on scheduled sync (see `docs/api.md`).

## Security notes

- Credentials are owner-scoped via RLS; treat operator accounts as sensitive.
- Cron sync uses the **Supabase service role** to iterate businesses; protect the cron route with a shared secret.

## Files

| Area            | Path |
|-----------------|------|
| HTTP client     | `src/lib/integrations/gizmo/client.ts` |
| Normalization   | `src/lib/integrations/gizmo/normalize.ts` |
| Invoice → sales | `src/lib/integrations/gizmo/invoice-to-sales.ts` |
| Persistence     | `src/lib/services/gizmo.ts` |
| UI              | `src/app/(app)/integrations/gizmo/page.tsx`, `src/components/integrations/gizmo-connect-form.tsx` |
| Dashboard strip | `src/components/dashboard/gizmo-dashboard-strip.tsx` |

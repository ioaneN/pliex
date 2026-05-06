-- =============================================================
-- Idempotent POS → sales ledger (investor-ready MVP)
-- =============================================================

alter table public.sales add column if not exists external_key text;

comment on column public.sales.external_key is
  'Stable upstream id for upsert, e.g. square:payment:123. Null for manual rows.';

create unique index if not exists sales_business_external_key_uidx
  on public.sales (business_id, external_key)
  where external_key is not null;

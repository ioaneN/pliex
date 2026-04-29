-- =============================================================
-- Internet café + Gizmo integration (MVP)
-- =============================================================

-- ---------- businesses: new type + POS ----------
alter table public.businesses drop constraint if exists businesses_business_type_check;
alter table public.businesses
  add constraint businesses_business_type_check
  check (business_type in ('cafe', 'bakery', 'food_shop', 'internet_cafe'));

alter table public.businesses
  add column if not exists pos_system text
  check (pos_system is null or pos_system = 'gizmo');

-- ---------- gizmo_connections (one per business, MVP) ----------
create table if not exists public.gizmo_connections (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null unique references public.businesses (id) on delete cascade,
  base_url        text not null,
  api_username    text not null default '',
  api_password    text not null default '',
  last_sync_at    timestamptz,
  last_sync_status text check (last_sync_status is null or last_sync_status in ('ok', 'error')),
  last_error      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists gizmo_connections_business_idx on public.gizmo_connections (business_id);

drop trigger if exists trg_gizmo_connections_updated_at on public.gizmo_connections;
create trigger trg_gizmo_connections_updated_at
  before update on public.gizmo_connections
  for each row execute function public.set_updated_at();

-- ---------- gizmo_sync_snapshots ----------
create table if not exists public.gizmo_sync_snapshots (
  id           uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  captured_at  timestamptz not null default now(),
  payload      jsonb not null default '{}'::jsonb
);

create index if not exists gizmo_snapshots_business_captured_idx
  on public.gizmo_sync_snapshots (business_id, captured_at desc);

-- ---------- RLS ----------
alter table public.gizmo_connections enable row level security;
alter table public.gizmo_sync_snapshots enable row level security;

drop policy if exists gizmo_connections_owner_all on public.gizmo_connections;
create policy gizmo_connections_owner_all on public.gizmo_connections
  for all using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

drop policy if exists gizmo_sync_snapshots_owner_all on public.gizmo_sync_snapshots;
create policy gizmo_sync_snapshots_owner_all on public.gizmo_sync_snapshots
  for all using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

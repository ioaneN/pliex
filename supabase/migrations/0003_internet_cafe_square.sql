-- =============================================================
-- Internet café + Square integration (fresh-db path)
-- =============================================================

-- ---------- businesses: new type + POS ----------
alter table public.businesses drop constraint if exists businesses_business_type_check;
alter table public.businesses
  add constraint businesses_business_type_check
  check (business_type in ('cafe', 'bakery', 'food_shop', 'internet_cafe'));

do $$
declare
  c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.businesses'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%pos_system%'
  loop
    execute format('alter table public.businesses drop constraint if exists %I', c.conname);
  end loop;
end $$;

alter table public.businesses add column if not exists pos_system text;
alter table public.businesses
  add constraint businesses_pos_system_check
  check (pos_system is null or pos_system = 'square');

-- ---------- square_connections (one per business, MVP) ----------
create table if not exists public.square_connections (
  id               uuid primary key default gen_random_uuid(),
  business_id      uuid not null unique references public.businesses (id) on delete cascade,
  access_token     text not null,
  location_id      text,
  environment      text not null default 'production'
    check (environment in ('production', 'sandbox')),
  last_sync_at     timestamptz,
  last_sync_status text check (last_sync_status is null or last_sync_status in ('ok', 'error')),
  last_error       text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists square_connections_business_idx on public.square_connections (business_id);

drop trigger if exists trg_square_connections_updated_at on public.square_connections;
create trigger trg_square_connections_updated_at
  before update on public.square_connections
  for each row execute function public.set_updated_at();

-- ---------- RLS ----------
alter table public.square_connections enable row level security;

drop policy if exists square_connections_owner_all on public.square_connections;
create policy square_connections_owner_all on public.square_connections
  for all using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

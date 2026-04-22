-- =============================================================
-- Pliex — initial schema (MVP)
-- One owner, one business. Single-tenant per row via business_id.
-- =============================================================

create extension if not exists "pgcrypto";

-- ---------- users ----------
-- Mirrors auth.users; created on first login by a trigger.
create table if not exists public.users (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null unique,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ---------- businesses ----------
create table if not exists public.businesses (
  id              uuid primary key default gen_random_uuid(),
  owner_user_id   uuid not null references public.users (id) on delete cascade,
  name            text not null,
  business_type   text not null check (business_type in ('cafe', 'bakery', 'food_shop')),
  currency        text not null default 'USD',
  created_at      timestamptz not null default now()
);

create index if not exists businesses_owner_idx on public.businesses (owner_user_id);

-- ---------- sales ----------
create table if not exists public.sales (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses (id) on delete cascade,
  amount       numeric(12, 2) not null check (amount >= 0),
  category     text,
  sale_date    date not null default current_date,
  notes        text,
  source       text not null default 'manual' check (source in ('manual', 'import', 'integration')),
  created_at   timestamptz not null default now()
);

create index if not exists sales_business_date_idx on public.sales (business_id, sale_date desc);

-- ---------- expenses ----------
create table if not exists public.expenses (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references public.businesses (id) on delete cascade,
  amount        numeric(12, 2) not null check (amount >= 0),
  category      text,
  expense_date  date not null default current_date,
  vendor_name   text,
  notes         text,
  source        text not null default 'manual' check (source in ('manual', 'import', 'integration')),
  created_at    timestamptz not null default now()
);

create index if not exists expenses_business_date_idx on public.expenses (business_id, expense_date desc);

-- ---------- inventory_items ----------
create table if not exists public.inventory_items (
  id                 uuid primary key default gen_random_uuid(),
  business_id        uuid not null references public.businesses (id) on delete cascade,
  name               text not null,
  quantity           numeric(12, 2) not null default 0,
  unit               text not null default 'unit',
  reorder_threshold  numeric(12, 2) not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists inventory_business_idx on public.inventory_items (business_id);

-- ---------- recommendations ----------
create table if not exists public.recommendations (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references public.businesses (id) on delete cascade,
  type          text not null check (type in ('growth', 'savings', 'operations', 'risk')),
  title         text not null,
  description   text not null,
  impact_label  text,
  status        text not null default 'open' check (status in ('open', 'accepted', 'dismissed')),
  created_at    timestamptz not null default now()
);

create index if not exists recommendations_business_status_idx on public.recommendations (business_id, status);

-- ---------- automations ----------
create table if not exists public.automations (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses (id) on delete cascade,
  name         text not null,
  description  text,
  is_enabled   boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists automations_business_idx on public.automations (business_id);

-- ---------- ai_conversations ----------
create table if not exists public.ai_conversations (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses (id) on delete cascade,
  user_id      uuid not null references public.users (id) on delete cascade,
  role         text not null check (role in ('user', 'assistant')),
  message      text not null,
  created_at   timestamptz not null default now()
);

create index if not exists ai_conversations_business_created_idx
  on public.ai_conversations (business_id, created_at);

-- ---------- updated_at triggers ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_inventory_updated_at on public.inventory_items;
create trigger trg_inventory_updated_at
  before update on public.inventory_items
  for each row execute function public.set_updated_at();

drop trigger if exists trg_automations_updated_at on public.automations;
create trigger trg_automations_updated_at
  before update on public.automations
  for each row execute function public.set_updated_at();

-- ---------- on auth.users insert: mirror to public.users ----------
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

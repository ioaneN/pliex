-- =============================================================
-- Paid SaaS v1: Stripe billing + Square OAuth hardening
-- =============================================================

-- ---------- subscriptions ----------
create table if not exists public.subscriptions (
  id                          uuid primary key default gen_random_uuid(),
  business_id                 uuid not null unique references public.businesses (id) on delete cascade,
  stripe_customer_id          text not null unique,
  stripe_subscription_id      text unique,
  status                      text not null default 'incomplete'
    check (status in (
      'incomplete',
      'incomplete_expired',
      'trialing',
      'active',
      'past_due',
      'canceled',
      'unpaid',
      'paused'
    )),
  price_id                    text,
  current_period_end          timestamptz,
  cancel_at_period_end        boolean not null default false,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index if not exists subscriptions_business_idx on public.subscriptions (business_id);
create index if not exists subscriptions_customer_idx on public.subscriptions (stripe_customer_id);
create index if not exists subscriptions_subscription_idx on public.subscriptions (stripe_subscription_id);

drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

alter table public.subscriptions enable row level security;

drop policy if exists subscriptions_owner_all on public.subscriptions;
create policy subscriptions_owner_all on public.subscriptions
  for all using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

-- ---------- square OAuth fields ----------
alter table public.square_connections
  alter column access_token drop not null,
  add column if not exists refresh_token text,
  add column if not exists access_token_expires_at timestamptz,
  add column if not exists merchant_id text,
  add column if not exists scope text,
  add column if not exists webhook_subscription_id text,
  add column if not exists connected_at timestamptz,
  add column if not exists disconnected_at timestamptz;

create unique index if not exists square_connections_merchant_uidx
  on public.square_connections (merchant_id)
  where merchant_id is not null and disconnected_at is null;

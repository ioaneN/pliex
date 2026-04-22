-- =============================================================
-- Pliex — Row Level Security
-- Owner-only access. A user can only see/modify rows that belong
-- to a business whose owner_user_id = auth.uid().
-- =============================================================

alter table public.users             enable row level security;
alter table public.businesses        enable row level security;
alter table public.sales             enable row level security;
alter table public.expenses          enable row level security;
alter table public.inventory_items   enable row level security;
alter table public.recommendations   enable row level security;
alter table public.automations       enable row level security;
alter table public.ai_conversations  enable row level security;

-- ---------- users: a user can read/update only their own row ----------
drop policy if exists users_select_own on public.users;
create policy users_select_own on public.users
  for select using (id = auth.uid());

drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users
  for update using (id = auth.uid());

-- ---------- businesses: owner-only ----------
drop policy if exists businesses_owner_all on public.businesses;
create policy businesses_owner_all on public.businesses
  for all using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

-- ---------- helper: is the current user the owner of business_id? ----------
create or replace function public.is_business_owner(b_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.businesses
    where id = b_id and owner_user_id = auth.uid()
  );
$$;

-- ---------- generic owner-scoped policy for all child tables ----------
do $$
declare
  t text;
begin
  foreach t in array array[
    'sales', 'expenses', 'inventory_items',
    'recommendations', 'automations', 'ai_conversations'
  ]
  loop
    execute format($q$
      drop policy if exists %1$s_owner_all on public.%1$s;
      create policy %1$s_owner_all on public.%1$s
        for all using (public.is_business_owner(business_id))
        with check (public.is_business_owner(business_id));
    $q$, t);
  end loop;
end $$;

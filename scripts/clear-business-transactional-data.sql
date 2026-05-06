-- One-shot cleanup: Square connection + sales/expenses/inventory/automations.
-- 1. Run: select id, name from public.businesses;
-- 2. Set `bid` below to your business id, then run in Supabase SQL Editor.
-- Onboarding no longer seeds demo rows; use this to reset an existing dev business.

do $$
declare
  bid uuid := '00000000-0000-0000-0000-000000000000';
begin
  delete from public.square_connections where business_id = bid;
  delete from public.sales where business_id = bid;
  delete from public.expenses where business_id = bid;
  delete from public.inventory_items where business_id = bid;
  delete from public.automations where business_id = bid;
end $$;

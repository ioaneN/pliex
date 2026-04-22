# ADR 0002 — One owner ↔ one business for MVP

**Status:** Accepted
**Date:** Initial MVP

## Context

A real product for cafés/bakeries will eventually need multi-location and
team support. We must not build that today.

## Decision

The MVP enforces a single business per owner.

- The `businesses` table has `owner_user_id`, no `team` table.
- `getOwnedBusiness()` returns the first row visible to the current
  Supabase session.
- The authenticated layout redirects to `/onboarding` if no business
  exists.

## Consequences

- The data model is dead-simple. `business_id` is the only tenant
  identifier on every other table.
- No business-switcher logic, no permission checks beyond RLS.
- When we add multi-business support, the schema is already shaped
  correctly: we'd add a `business_members` join table and broaden
  `is_business_owner()` into `is_business_member()`. No table renames.

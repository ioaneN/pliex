# ADR 0001 — Google-only authentication for MVP

**Status:** Accepted
**Date:** Initial MVP

## Context

The product is for individual food-business owners. Sign-in is a
significant point of friction at the top of the funnel.

## Decision

The MVP supports **only** Google OAuth via Supabase. No email/password,
no magic links, no Apple, no team invites.

## Consequences

- Sign-in surface is one button → near-zero cognitive load.
- No password reset / email verification flows to build, test, or babysit.
- We exclude users who don't want to authenticate with Google. Acceptable
  trade-off for an MVP focused on calm, fast onboarding.
- We do not need an `accounts`/`identities` table — `auth.users` is the
  source of truth and a trigger mirrors it into `public.users`.

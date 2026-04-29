# Feature: Onboarding

Goal: turn a freshly authenticated Google user into an owner with a
seeded, ready-to-explore **internet café** business in under 30 seconds.

## Inputs

- Business name
- Business type — fixed to **`internet_cafe`** (hidden field in the form)
- Currency (USD by default; small curated list)
- Sales / expense “tracking” fields are fixed to **`Gizmo`** for schema
  compatibility (informational today; optional POS connection is configured
  later under **Integrations**)

## Flow

1. Owner finishes Google OAuth → `/auth/callback` → `/onboarding`
   (because no business row exists yet).
2. `OnboardingForm` posts to the `completeOnboarding` Server Action.
3. The action validates with `onboardingSchema` (Zod) — `businessType` must
   be `internet_cafe`.
4. `createBusiness()` writes the row with `owner_user_id = auth.uid()`,
   `business_type = 'internet_cafe'`, and `pos_system = 'gizmo'` (POS
   integration is still optional until the owner saves credentials under
   Integrations).
5. `seedDemoDataForBusiness()` populates 14 days of believable sales,
   expenses, inventory tuned to an internet café, and the 3 default
   automations.
6. Action calls `redirect("/dashboard")`.

## Why we seed

A blank dashboard fails the "calm and clear" promise. Seeding believable
demo data makes the first session feel like a real product, not a tutorial,
and lets the recommendations engine immediately produce something useful.

## Idempotency

Seeding is per-business and per-table: each helper checks whether the
relevant table is empty for the business before inserting. Re-running the
seed (e.g. after manual cleanup) is safe.

## What we deliberately did NOT do

- Multi-step stepper UI. A single short form is faster and respects the
  owner's time more than a wizard.
- Branding upload, hours, etc. Those belong to a future settings page —
  not the first 30 seconds.

## See also

- [Integrations (POS sync)](integrations.md) — optional Gizmo connection after signup.

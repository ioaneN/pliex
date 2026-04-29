# Architecture

Pliex is a single Next.js (App Router) application backed by Supabase
(Postgres + Google OAuth) with outbound integrations: **OpenAI** for the
assistant, **Resend** for the weekly email, and **optional HTTPS calls** to
an owner-configured POS web API (see `lib/integrations/gizmo/`).

```
                 ┌─────────────────────────────┐
                 │       Browser (owner)       │
                 └──────────┬──────────────────┘
                            │
                  Server Components / Actions
                            │
   ┌────────────────────────┴───────────────────────────┐
   │                Next.js (Vercel)                    │
   │  app/(marketing)  app/(auth)  app/(app)  app/api   │
   │            └──────── lib/services ─────────┘       │
   │   lib/recommendations  lib/automations  lib/ai     │
   └──────┬──────────────────┬─────────────────┬────────┘
          │                  │                 │
   ┌──────▼─────┐     ┌──────▼─────┐    ┌──────▼─────┐
   │  Supabase  │     │   OpenAI   │    │   Resend   │
   │  Postgres  │     │   Chat API │    │   Emails   │
   │  + Auth    │     │            │    │            │
   └────────────┘     └────────────┘    └────────────┘
```

## Layered design

Each feature flows through clearly separated layers:

| Layer            | Lives in                       | Responsibility                                  |
|------------------|--------------------------------|-------------------------------------------------|
| Presentation     | `components/`, route `page.tsx` | Render UI; never speaks to a third-party SDK   |
| Validation       | `lib/validation/schemas.ts`    | Zod schemas, single source of truth             |
| Server Actions   | `app/.../actions.ts`            | Form handlers; orchestrate validation + service |
| Services         | `lib/services/*`                | Owner-scoped data access (Supabase)             |
| Domain logic     | `lib/recommendations`, `lib/automations` | Pure functions — no I/O                |
| Integrations     | `lib/ai`, `lib/email`, `lib/integrations/*` | OpenAI, Resend, optional POS HTTP         |
| Auth             | `lib/supabase/*`, `middleware.ts` | Session refresh + route gating                |
| Configuration    | `lib/utils/env.ts`              | Typed env access, fail-fast                     |

## Single-tenant invariant

The MVP is one owner ↔ one business. The invariant is enforced in two
places:

1. **Database (RLS).** Every owner-scoped table delegates access to
   `is_business_owner(business_id)`, which checks
   `businesses.owner_user_id = auth.uid()`.
2. **Application layer.** `getOwnedBusiness()` returns the single business
   row visible to the current Supabase session, and the authenticated layout
   redirects to `/onboarding` if the row doesn't exist yet.

## Read paths

The dashboard, recommendations engine, and AI assistant all read the same
deterministic snapshot (`lib/services/business-snapshot.ts`). This keeps
them in agreement: the AI never sees different numbers from the dashboard.

## Write paths

Mutating actions (add sale, add expense, complete onboarding) are Next.js
Server Actions. They:

1. Validate input via Zod (`lib/validation/schemas.ts`).
2. Call a service (`lib/services/*`).
3. `revalidatePath()` the affected pages.

## Failure modes

- **No OpenAI key:** `lib/ai/assistant.ts` returns a deterministic fallback
  built from the snapshot. The UI never breaks.
- **No Resend key:** `sendWeeklySummaryEmail()` returns `false` instead of
  throwing.
- **No session:** `middleware.ts` redirects to `/sign-in` with the
  originally requested URL preserved as `?redirect=`.
- **No business yet:** The authenticated layout redirects to `/onboarding`.

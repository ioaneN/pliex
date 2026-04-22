# Deployment

## Vercel + Supabase (production)

1. **Create the Supabase project.**
   - Run `supabase/migrations/0001_initial_schema.sql` and
     `supabase/migrations/0002_row_level_security.sql` in the SQL editor.
   - Authentication → Providers → enable Google with your OAuth credentials.
   - URL Configuration → add `https://<your-domain>/auth/callback`.

2. **Create the Vercel project.**
   - Connect this repo.
   - Set the following environment variables in **Production**:

     | Variable                          | Source                                    |
     |-----------------------------------|-------------------------------------------|
     | `NEXT_PUBLIC_SITE_URL`            | `https://<your-domain>`                   |
     | `NEXT_PUBLIC_SUPABASE_URL`        | Supabase project URL                      |
     | `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Supabase anon key                         |
     | `SUPABASE_SERVICE_ROLE_KEY`       | Supabase service role (server only)       |
     | `OPENAI_API_KEY`                  | OpenAI                                    |
     | `OPENAI_MODEL`                    | `gpt-4o-mini` (or your preferred model)   |
     | `RESEND_API_KEY`                  | Resend                                    |
     | `RESEND_FROM_EMAIL`               | e.g. `Pliex <noreply@yourdomain.com>`     |

3. **Deploy.** Vercel will run `next build`. The first request after deploy
   will warm up the Supabase + OpenAI clients.

## Local development

- `cp .env.example .env.local` and fill in the same variables.
- `OPENAI_API_KEY` and `RESEND_API_KEY` are optional in dev — the assistant
  falls back to a deterministic local answer and the weekly summary just
  returns `false` instead of throwing.
- `npm run dev` and visit http://localhost:3000.

## Operational checks

- `GET /api/health` → 200
- Sign in with Google → ends on `/onboarding` (new) or `/dashboard` (returning)
- Open `/dashboard` → KPIs, chart, summary, recommendations all render
- Add a sale on `/transactions` → appears in "Recent activity" on `/dashboard`

## Backups

Supabase manages Postgres backups automatically (per their plan). For
recovery testing, restore to a temporary project, re-apply migrations, and
verify the dashboard renders for a known account.

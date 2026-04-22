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

> `NEXT_PUBLIC_SITE_URL` is **inlined into the client bundle at build
> time** and is also used server-side by `app/auth/callback/route.ts` to
> build post-sign-in redirects. Changing it requires a fresh build (and,
> on a self-hosted Node deploy, a process restart).

## Self-hosted (EC2 + nginx)

Same env vars as above. Two extra constraints:

1. **Increase nginx proxy buffers** — Supabase auth cookies overflow the
   default header buffer and produce a 502 on `/auth/callback`:

   ```nginx
   proxy_buffer_size           128k;
   proxy_buffers               4 256k;
   proxy_busy_buffers_size     256k;
   large_client_header_buffers 4 16k;
   ```

2. **Set `NEXT_PUBLIC_SITE_URL` to the public origin** (`http://<ip>` or
   `https://<domain>`) before `npm run build`. The callback handler
   relies on this to redirect users back to the public host instead of
   the bound interface (`http://localhost:3000`).

After changing env or code, rebuild and restart:

```bash
cd ~/app/pliex
npm run build
pm2 restart myapp --update-env
```

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

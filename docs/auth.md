# Authentication

Pliex uses **Supabase Auth with Google as the only provider.** No email +
password, no magic links, no Apple. This is a deliberate constraint: it
keeps the MVP small and the sign-in surface familiar.

## Flow

```
Owner → /sign-in → Google consent screen →
  /auth/callback?code=... →
    exchangeCodeForSession() →
      has business?  yes → /dashboard
                     no  → /onboarding
```

### Implementation

| Step                              | Code                                          |
|-----------------------------------|-----------------------------------------------|
| Show "Continue with Google"       | `components/landing/google-sign-in-button.tsx` |
| Open Google                       | `supabase.auth.signInWithOAuth({ provider: "google", options.redirectTo })` |
| Mirror to `public.users` on first login | `trg_on_auth_user_created` trigger     |
| Exchange code for session         | `app/auth/callback/route.ts`                  |
| Decide where to land              | Same handler reads `businesses` for the user  |
| Sign out                          | `app/auth/sign-out/route.ts`                  |

## Route protection

There are two layers of protection:

1. **Edge middleware** (`src/middleware.ts`).
   - Refreshes the Supabase session cookie on every request.
   - If the path is not in `PUBLIC_ROUTES`, requires a session and otherwise
     redirects to `/sign-in?redirect=<original>`.

2. **Authenticated layout** (`src/app/(app)/layout.tsx`).
   - Re-checks the session on the server (defence in depth).
   - Loads the owner's business; if none exists, redirects to `/onboarding`.

`/onboarding` itself has the inverse guard: signed-in users with a business
are kicked to `/dashboard`.

## Supabase project setup

1. Authentication → Providers → **Google**: enable, paste OAuth client
   ID/secret from Google Cloud.
2. URL Configuration → add the following redirect URLs:
   - `http://localhost:3000/auth/callback` (dev)
   - `https://<your-vercel-domain>/auth/callback` (prod)
3. Apply both SQL migrations.
4. Verify the `trg_on_auth_user_created` trigger fires by signing in once
   with Google and checking that `public.users` has a matching row.

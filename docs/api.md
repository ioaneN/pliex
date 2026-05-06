# API

The paid SaaS v1 keeps user mutations in Server Actions where practical, with
route handlers for AI, billing, Square OAuth/sync, webhooks, and cron jobs.

## `GET /api/assistant`

Load recent assistant messages for the signed-in owner’s business (used to
bootstrap the mobile assistant panel).

**Auth:** required.

**Response 200:**

```json
{
  "messages": [
    { "role": "user", "content": "How were sales this week?" },
    { "role": "assistant", "content": "…" }
  ]
}
```

**Errors:** `401` — not signed in; `400` — no business yet.

## `POST /api/assistant`

Ask the AI assistant a question, grounded in the owner's business snapshot.

**Auth:** required.
**Body:**

```json
{ "question": "How were sales this week?" }
```

**Response 200:**

```json
{ "answer": "This week so far you've taken in $4,820 …" }
```

**Errors:**

- `401` — not signed in
- `400` — no business yet (need to onboard)
- `422` — question failed validation
- `500` — upstream OpenAI failure

The handler:

1. Resolves the current user + business.
2. Builds a `BusinessSnapshot`.
3. Persists the user message into `ai_conversations`.
4. Calls `answerBusinessQuestion()`.
5. Persists the assistant message.
6. Returns the answer.

## `POST /api/billing/checkout`

Creates a Stripe Checkout session for the signed-in owner’s business.

**Auth:** required.

**Response 200:** `{ "url": "https://checkout.stripe.com/..." }`

## `POST /api/billing/portal`

Creates a Stripe Customer Portal session for an existing customer.

**Auth:** required.

**Response 200:** `{ "url": "https://billing.stripe.com/..." }`

## `POST /api/webhooks/stripe`

Receives Stripe subscription lifecycle events. Verifies
`Stripe-Signature` using `STRIPE_WEBHOOK_SECRET`, then updates
`subscriptions` with the service role client.

**Auth:** Stripe webhook signature.

## `GET /api/integrations/square/oauth/start`

Starts Square OAuth. Creates a signed state cookie and redirects the owner to
Square authorization.

**Auth:** required.

## `GET /api/integrations/square/oauth/callback`

Validates Square OAuth state, exchanges `code` for tokens, stores encrypted
tokens in `square_connections`, runs initial sync, then redirects to
`/integrations/square`.

## `POST /api/integrations/square/sync`

Pulls completed payments from the saved Square connection and **upserts rows
into `sales`** with `source = 'integration'` and stable
`external_key = square:payment:<id>`. Re-sync is idempotent by
`(business_id, external_key)`.

**Auth:** required (owner session).

**Response 200:** `{ "ok": true, "salesApplied": <n>, "fetchedPayments": <n> }`
or `{ "ok": false, "error": "…", ... }` when sync fails.

## `POST /api/integrations/square/disconnect`

Revokes/deletes the active Square connection metadata and clears stored tokens.

**Auth:** required.

## `GET /api/cron/square-sync`

Hourly reconciliation sync for all connected Square accounts. Requires
`Authorization: Bearer <CRON_SECRET>` and `SUPABASE_SERVICE_ROLE_KEY`.

## `GET /auth/callback?code=...&redirect=/dashboard`

OAuth landing page after Google. Exchanges the code, then redirects to
`/onboarding` if the owner hasn't created a business yet, or to the
requested target otherwise.

## `POST /auth/sign-out`

Calls `supabase.auth.signOut()` and redirects to `/`.

## `GET /api/health`

Liveness probe. Returns `{ ok: true, service: "pliex", time }`.

## Server Actions (not HTTP, but listed for completeness)

| Action                                  | File                                          | Purpose                  |
|-----------------------------------------|-----------------------------------------------|--------------------------|
| `completeOnboarding(prev, formData)`    | `app/(auth)/onboarding/actions.ts`            | Create business + seed   |
| `addSaleAction(prev, formData)`         | `app/(app)/transactions/actions.ts`           | Persist a sale           |
| `addExpenseAction(prev, formData)`      | `app/(app)/transactions/actions.ts`           | Persist an expense       |

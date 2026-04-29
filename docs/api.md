# API

The MVP has very few HTTP endpoints — most mutations happen through Server
Actions, which Next.js handles transparently.

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

## `POST /api/integrations/gizmo/connect`

Save or update the owner’s **Gizmo Web API** connection (public HTTPS base
URL + operator credentials). Tests reachability before persisting.

**Auth:** required.

**Body (JSON):** `{ "baseUrl": "https://…", "apiUsername": "…", "apiPassword": "…" }`
(password may be omitted on update to keep the stored password).

**Response 200:** `{ "ok": true, "message": "…", "connection": { … } }`

**Errors:** `401`, `400` (validation / probe failure), `422`, `500`.

## `POST /api/integrations/gizmo/sync`

Pulls host / invoice / product endpoints from the saved connection, writes a
row to `gizmo_sync_snapshots`, **upserts matching rows into `sales`** when the
invoice response is HTTP 2xx (see `applyGizmoInvoicesToSales`), and updates
`gizmo_connections` sync metadata.

**Auth:** required (owner session).

**Response 200:** `{ "ok": true, "normalized": { … }, "salesApplied": <n> }`
or `{ "ok": false, "error": "…", "salesApplied": <n> }` when snapshot saved
but import or API failed.

## `GET /api/cron/gizmo-sync`

Hourly batch sync for **all** `gizmo_connections` (requires
**`SUPABASE_SERVICE_ROLE_KEY`**).

**Auth:** `Authorization: Bearer <CRON_SECRET>` (must match `CRON_SECRET` in
`serverEnv`). Public to middleware but useless without the secret.

**Response 200:** `{ "synced": number, "errors": string[] }`

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

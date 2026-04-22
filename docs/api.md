# API

The MVP has very few HTTP endpoints — most mutations happen through Server
Actions, which Next.js handles transparently.

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

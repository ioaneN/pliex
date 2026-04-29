# Feature: AI Assistant

A grounded chat surface that answers practical questions about the
owner's business — never generic AI fluff.

## Endpoints

- UI: `/assistant` (full-page chat; server loads the last 20 messages).
- HTTP (see `docs/api.md`):
  - **`GET /api/assistant`** — returns `{ messages }` for the signed-in
    owner’s business. Used to bootstrap the **docked** assistant (desktop)
    and the **slide-over** assistant (mobile) from `layout/app-shell.tsx`.
  - **`POST /api/assistant`** — `{ question }` → `{ answer }`; persists
    user + assistant rows to `ai_conversations`.

## UI surfaces

The same `AssistantChat` component is reused in three places:

1. **`/assistant`** — dedicated page with history from the server on first
   render.
2. **Desktop (`md` and up)** — optional **third column** when the user opens
   the assistant via the **FAB** (same sparkles control as mobile). Main
   content stays visible beside the dock. The dock is **hidden** on
   `/assistant` so the full page is the only chat UI. Resizing to **below
   `md`** closes the panel; it does **not** auto-open when widening again.
3. **Mobile (below `md`)** — **FAB** (sparkles) opens a **right sheet** over
   a light backdrop; **hamburger** in the top bar opens the nav drawer
   (assistant closes when the menu opens).

Scroll locking applies to the **mobile nav** and **mobile assistant sheet**,
not to the desktop dock.

## Grounding

Every request rebuilds a fresh `BusinessSnapshot` and passes it to OpenAI
as a system message (including the **`gizmo`** block when the latest POS
sync produced metrics — otherwise `null`).

The system prompt depends on the business:

- **`internet_cafe`** or **`pos_system === 'gizmo'`** — internet café
  wording; the model must use `snapshot.gizmo` when present and must not
  invent PC or invoice counts when it is `null`.
- **Other legacy types** — original “small food business” tone.

Shared rules:

- Three to five sentences max.
- Always ground in the JSON snapshot — do not invent numbers.
- Prefer one clear next action.
- Use the business' currency.
- Never say "as an AI".

This keeps responses tight and useful.

## Quick prompts

The chat surface ships with the prompts the spec asked for:

- "How were sales this week?"
- "What should I reorder?"
- "What is hurting profit?"
- "Which day is weakest?"
- "What should I do this week?"

These are not magic — they're plain questions that go through the same
`POST /api/assistant` handler.

## Persistence

Each user message and assistant message is appended to
`ai_conversations`. The `/assistant` page rehydrates the last **20** rows
on the server. The shell panel calls **`GET /api/assistant`** when opened
so the dock or sheet stays in sync with the same store.

## Dev fallback

If `OPENAI_API_KEY` is not configured, `localFallbackAnswer()` returns a
deterministic 2-3 sentence summary based on the snapshot. The product
keeps working in local development without a key.

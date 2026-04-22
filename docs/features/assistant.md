# Feature: AI Assistant

A grounded chat surface that answers practical questions about the
owner's business — never generic AI fluff.

## Endpoints

- UI: `/assistant`
- HTTP: `POST /api/assistant` (see `docs/api.md`)

## Grounding

Every request rebuilds a fresh `BusinessSnapshot` and passes it to OpenAI
as a system message. The model is told:

- Speak like a calm, plain-spoken business advisor.
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
`/api/assistant` endpoint.

## Persistence

Each user message and assistant message is appended to
`ai_conversations`. On page load, the last 20 messages are rehydrated.

## Dev fallback

If `OPENAI_API_KEY` is not configured, `localFallbackAnswer()` returns a
deterministic 2-3 sentence summary based on the snapshot. The product
keeps working in local development without a key.

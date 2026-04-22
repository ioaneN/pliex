# Feature: Recommendations engine

A pure, deterministic, rule-based engine. No ML, no API calls.

## Why rule-based first

- Owners need explanations they can trust on day 1. Rules are inspectable.
- The rules already cover 80% of the conversations a small food owner has
  with their books.
- Every rule maps to a real next action, not a vague insight.

## Rules (today)

| Rule                          | Type        | Trigger                                                  | Why it matters                                |
|-------------------------------|-------------|----------------------------------------------------------|-----------------------------------------------|
| Monday morning promo          | growth      | Monday sales < 70% of avg of other days                  | Mondays are the most fixable weak spot        |
| Inventory will run thin       | risk        | Any item ≤ `reorder_threshold`                           | Out-of-stock kills sales the same day         |
| Rising expense category       | savings     | Category up ≥ 25% WoW (≥ $50 in absolute spend)          | Catching cost creep early is high-leverage    |
| Quiet weekday                 | operations  | Weakest weekday < 50% of weekday avg                     | Suggests a shift change or a localized offer  |

## Adding a new rule

1. Add a function with signature `(snapshot: BusinessSnapshot) => DraftRecommendation[]` to `engine.ts`.
2. Append it to the `RULES` array.
3. Update this doc and `docs/changelog.md`.
4. (Future) Add a unit test in `__tests__/recommendations`.

## Picking what to show

`pickTopByType(drafts, type)` picks the highest-priority draft per type.
Priorities are encoded in each rule (e.g. low-stock = 100, Monday promo =
80) so the dashboard surfaces the most impactful item.

## Future

- Persist accepted/dismissed recommendations into `public.recommendations`
  to avoid re-suggesting things the owner has already acted on.
- Layer an LLM-based "explain this recommendation" call on top.

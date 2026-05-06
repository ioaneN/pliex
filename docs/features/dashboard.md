# Feature: Dashboard

The dashboard is the product. Everything else is in service of it.

## Promise

> Every morning, the owner signs in and immediately sees yesterday's
> sales, expenses, profit, low-stock alerts, one growth recommendation,
> one savings recommendation, and one clear next action.

## Composition

```
┌──────────────────────────────────────────────────────────┐
│ PageHeader: "Good morning, <name>"                       │
├──────────────────────────────────────────────────────────┤
│ SummaryCard: today in one paragraph                      │
├──────────────────────────────────────────────────────────┤
│ KpiCard × 4                                              │
│  Sales yesterday | Expenses yesterday | Profit | Health  │
├──────────────────────────────────────────────────────────┤
│ SalesChart (7 weekday SVG)         | InventoryAlertCard  │
├──────────────────────────────────────────────────────────┤
│ RecommendationCard × 3                                   │
│  growth | savings | risk                                 │
├──────────────────────────────────────────────────────────┤
│ ActivityList (mixed sales + expenses, last 6)            │
└──────────────────────────────────────────────────────────┘
```

## Reads

The page calls:

- `getOwnedBusiness()` (from the layout, but also needed for currency)
- `buildBusinessSnapshot(business.id)` — the canonical 14-day snapshot
- `listRecentSales(business.id, 6)`
- `listRecentExpenses(business.id, 6)`
- `generateRecommendations(snapshot)` + `pickTopByType()`

All of these run on the server in parallel.

## Why one snapshot

The dashboard, the recommendations engine and the AI assistant all share
`buildBusinessSnapshot`. This guarantees that when the owner asks the AI
"how were sales this week?" the answer matches the dashboard exactly.

**Square:** after a successful sync, POS rows are merged into the same `sales`
table (`source = 'integration'`), so KPIs and charts include synced payments
without a second data source.

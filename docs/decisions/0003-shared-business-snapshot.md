# ADR 0003 — Shared `BusinessSnapshot`

**Status:** Accepted
**Date:** Initial MVP

## Context

The dashboard, the recommendations engine, and the AI assistant all need
to "look at" the business' recent activity. If they each query the
database independently, they will sometimes disagree (different time
windows, different filters, race conditions). For a calm, trustworthy
product, the dashboard and the AI must never contradict each other.

## Decision

Introduce a single function, `buildBusinessSnapshot(businessId)`, that
returns a typed read-only view of the last 14 days:

- Sales totals (today, yesterday, this week, last week)
- Expense totals (same windows)
- Per-weekday sales totals (last 7 days)
- Weakest weekday
- Per-category expense delta (this week vs last week)
- Inventory + low-stock subset

The dashboard, the recommendations engine, the AI assistant, and the
weekly summary email all consume this same snapshot.

## Consequences

- Any change to the snapshot (new field, changed window) propagates to
  every consumer at once → consistency by construction.
- The snapshot is a natural unit-test boundary: feed it fixtures, assert
  recommendations.
- Slightly more reads upfront than strict per-feature queries — acceptable
  because the volumes are small and the queries hit RLS-aware indexes.

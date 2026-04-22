# Feature: Automations

The MVP ships with exactly three automations.

## 1. Weekly summary email

- File: `lib/automations/weekly-summary.ts`
- Trigger: Monday morning (cron — to be wired in via Vercel Cron + a
  scheduled route handler in a follow-up).
- Effect: sends a short HTML email with the previous week's sales,
  expenses, profit, week-over-week sales delta, and any low-stock items.
- Failure mode: if `RESEND_API_KEY` is missing, returns `false` (no throw).

## 2. Low-stock reorder draft

- File: `lib/automations/reorder-draft.ts`
- Trigger: every render of `/inventory` (cheap, pure function).
- Effect: surfaces a reorder draft with suggested quantities equal to
  `2 × reorder_threshold − current_quantity`.
- The "Send to supplier" button is intentionally inert in this MVP.

## 3. Expense auto-categorization

- File: `lib/automations/expense-categorizer.ts`
- Trigger: every `addExpenseAction` call where the owner left the category
  blank.
- Effect: regex-matches vendor + notes against a small keyword table to
  pick a category (Ingredients, Suppliers, Utilities, Rent, Payroll,
  Equipment, Marketing, Packaging) and falls back to "Other".

## Why only three

The product promise is calm. Each automation must justify its existence
and be obvious in the UI. Three is the maximum that can be explained in a
single sentence each on the dashboard.

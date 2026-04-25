# Frontend

## Routing

| Route            | Group           | Notes                                              |
|------------------|-----------------|----------------------------------------------------|
| `/`              | `(marketing)`   | Public landing page                                |
| `/sign-in`       | `(auth)`        | Google sign-in entry point                         |
| `/onboarding`    | `(auth)`        | First-time business setup                          |
| `/dashboard`     | `(app)`         | Daily command center                               |
| `/transactions`  | `(app)`         | Add sales/expenses + recent history                |
| `/inventory`     | `(app)`         | Inventory + reorder draft                          |
| `/assistant`     | `(app)`         | Full-page AI assistant chat                          |
| `/auth/callback` | route handler   | Supabase OAuth redirect target                     |
| `/auth/sign-out` | route handler   | POST to sign out                                   |
| `/api/assistant` | route handler   | `GET` → `{ messages }`; `POST` `{ question }` → `{ answer }` |
| `/api/health`    | route handler   | Liveness check                                     |

## Design system

The visual language comes from the original prototypes (`prototypes/`):

- **Palette:** nostalgic navy on warm cream paper, brass accent.
- **Typography:** Fraunces (serif headings, italic accent) + Inter (UI).
- **Surface:** off-white card on a paper-grain background.

Tokens live in `tailwind.config.ts` (colors, fonts, radii, shadows).
Global base styles live in `src/app/globals.css`.

## Components

| Component                              | Purpose                                                |
|----------------------------------------|--------------------------------------------------------|
| `ui/button.tsx`                        | Primary, ghost, link variants (CVA)                    |
| `ui/card.tsx`                          | Card / Header / Title / Subtitle / Body                |
| `ui/input.tsx`, `ui/select.tsx`        | Form primitives                                         |
| `ui/badge.tsx`                         | Status pill (good, bad, warn, sky, brass, neutral)     |
| `ui/eyebrow.tsx`                       | Small label-above-headline element                     |
| `ui/brand-mark.tsx`                    | "Pliex" logo + wordmark                                |
| `layout/sidebar.tsx`                   | Dark sidebar; mobile off-canvas + close row; closes after nav |
| `layout/topbar.tsx`                    | Sticky search + bell + owner badge; **hamburger** (`md:hidden`) opens mobile nav |
| `layout/app-shell.tsx`                 | Responsive grid: **FAB** opens dock (≥`md`) or sheet (<`md`); assistant **closed by default**, nav backdrop |
| `layout/page-header.tsx`               | Eyebrow + title + subtitle + actions                   |
| `landing/*`                            | Hero, features, how-it-works, why-pliex, CTA           |
| `landing/google-sign-in-button.tsx`    | Calls `supabase.auth.signInWithOAuth({ provider: "google" })` |
| `onboarding/onboarding-form.tsx`       | Server-action driven setup form                        |
| `dashboard/kpi-card.tsx`               | KPI surface with optional trend pill                   |
| `dashboard/summary-card.tsx`           | "Today, in one paragraph" AI summary                   |
| `dashboard/recommendation-card.tsx`    | Growth / Savings / Operations / Risk variants          |
| `dashboard/inventory-alert-card.tsx`   | Low-stock surface                                      |
| `dashboard/sales-chart.tsx`            | SVG sparkline of last 7 weekdays                       |
| `dashboard/activity-list.tsx`          | Mixed sales/expenses feed                              |
| `transactions/add-sale-form.tsx`       | Inline server-action form, resets on success           |
| `transactions/add-expense-form.tsx`    | Same pattern, with auto-categorization fallback        |
| `transactions/transaction-table.tsx`   | Paginated-ready table                                  |
| `inventory/inventory-table.tsx`        | Quantity, threshold, OK/Low                            |
| `inventory/reorder-draft-card.tsx`     | Suggested reorder lines                                |
| `assistant/assistant-chat.tsx`         | Chat surface with streaming-feel UI                    |
| `assistant/quick-prompt-chips.tsx`     | One-click question shortcuts                           |

## Conventions

- **Server-first.** Pages are server components and fetch directly via the
  service layer. Only forms, chat, OAuth, and the **authenticated shell**
  use `"use client"` where needed.
- **Data shape locality.** Each page builds the props its components need;
  leaf components avoid importing the service layer. **Exception:** the app
  shell `GET /api/assistant` fetch bootstraps `AssistantChat` in the dock /
  mobile sheet so history matches `ai_conversations` without duplicating
  server data loaders in a client layout.
- **Empty / loading / error states** are first-class — every list checks
  `length === 0` and every authenticated route ships an `error.tsx` /
  `loading.tsx`.
- **No deep nesting.** Components stay flat (≤ 2 levels of conditional).

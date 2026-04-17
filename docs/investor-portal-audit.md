# Investor Portal — Interaction Audit

> Audit performed 2026-04-17 for tomorrow's demo presentation.
> Scope: every interactive element reachable from `/investor` and `/investor?standalone`.

## Files in scope

- `src/pages/InvestorPortalPage.tsx` (main page)
- `src/components/layout/InvestorLayout.tsx` (sidebar / header / footer)
- `src/App.tsx` (route config)

No nested sub-components specific to the investor portal exist — the page uses
shared UI (`LoadingSkeleton`, `EmptyState`, `recharts`, `lucide-react` icons).

## Interaction inventory

| # | Element | File:line | Current behavior | Verdict | Proposed fix |
|---|---------|-----------|------------------|---------|--------------|
| 1 | **Logo link** "CapitalBridge / Investor" | `InvestorLayout.tsx:27` | `Link to="/investor"` | OK | none |
| 2 | Nav item **"Portfolio"** | `InvestorLayout.tsx:7` | `Link to="/investor"` | OK | none |
| 3 | Nav item **"Reports"** | `InvestorLayout.tsx:8` | `Link to="/investor/reports"` — no route exists, lands on `NotFound` | **BROKEN** | Drop the route from nav, or keep and route `/investor/reports` to a Reports tab within the portal. Minimal fix: scroll to / switch to a "Reports" tab inside the existing page. Simpler: remove Reports nav item for now. **Chosen fix**: add a client-side tab state so `/investor/reports` renders a reports view reusing the existing data. |
| 4 | **"Back to Platform"** link | `InvestorLayout.tsx:64` | `Link to="/dashboard"` (only shown for admin/analyst/PM and not standalone) | OK | none |
| 5 | **Help icon** button | `InvestorLayout.tsx:71` | `<button>` no onClick — decorative | **BROKEN** (dead) | Wire a simple toast with contact info, or convert to `<a href="mailto:...">`. **Chosen fix**: convert to `<a>` with `mailto:investors@capitalbridge.com`. |
| 6 | **Bell (notifications)** | `InvestorLayout.tsx:74` | `<button>` no onClick — shows red dot always | **BROKEN** (dead) | Wire to a toast listing upcoming payments from local data. |
| 7 | **Sign-out icon link** | `InvestorLayout.tsx:78` | `Link to="/"` — does NOT call `signOut()`, user stays logged in, just navigated to landing | **BROKEN** | Convert to `<button>` that calls `signOut()` then `navigate("/login")` (matches `AppLayout.handleLogout`). |
| 8 | Profile avatar (right) | `InvestorLayout.tsx:85` | Decorative `<div>` | OK (decorative) | none — no tooltip needed for demo |
| 9 | Footer **Privacy / Terms / Contact** | `InvestorLayout.tsx:106-108` | `<a href="#">` — jumps to top | **BROKEN** (dead) | For demo, route Privacy/Terms to `/about` anchors (page exists) and Contact to `mailto:`. |
| 10 | **"Tax Report"** button | `InvestorPortalPage.tsx:62` | `onClick={() => generateTaxReport(deals)}` — generates PDF | OK | none |
| 11 | **"Invest Now"** button | `InvestorPortalPage.tsx:69` | `<button>` no onClick — decorative | **BROKEN** (dead) | Route to `/deals` (same as "Browse deals" CTA in EmptyState). |
| 12 | **Period tabs** (1M / 3M / 6M / 1Y / All) | `InvestorPortalPage.tsx:154-166` | `setPeriod(p)` — state updates but chart data is **always the same** `portfolioHistory` array (9 months, "Jul..Mar"). Tabs are cosmetic. | **BROKEN** (stub) | Actually slice the dataset based on `period`. 1M=last 1 pt, 3M=last 3, 6M=last 6, 1Y=last 12, All=all. |
| 13 | **"View All"** link (My Investments header) | `InvestorPortalPage.tsx:232` | `Link to="/deals"` | OK | none |
| 14 | **Investment rows** (per deal) | `InvestorPortalPage.tsx:257` | `Link to={/deals/${deal.id}}` | OK | none |
| 15 | **"Browse deals"** CTA (empty state) | `InvestorPortalPage.tsx:244` | `Link to="/deals"` | OK | none |
| 16 | **Upcoming Payments rows** | `InvestorPortalPage.tsx:302` | Static `<div>` — not clickable | OK (informational) | none |
| 17 | **Asset-allocation pie** | — | Recharts Tooltip on hover | OK | none |
| 18 | **Performance area chart** | — | Recharts Tooltip on hover | OK | none |

## Additional gap

- **Download/export** is limited to PDF tax report. For a demo, it's worth adding a
  **CSV export** of the investor's positions (one click → CSV file). This
  re-enforces the "working export" story.

## Summary

| Status | Count |
|--------|-------|
| Total interactive elements audited | 18 |
| Working as-is | 11 |
| Broken / dead / stub | 7 |

Fixes below (phase 2).

## Phase 2 — fixes planned

1. `InvestorLayout` **Sign-out**: convert `<Link to="/">` to a button that calls
   `useAuth().signOut()` then `navigate("/login")`.
2. `InvestorLayout` **Help** button → `<a href="mailto:investors@capitalbridge.com">`
   with `title` tooltip.
3. `InvestorLayout` **Bell** button → toast listing upcoming payments count.
4. `InvestorLayout` **Footer links** → route to `/about` for Privacy/Terms and
   `mailto:` for Contact.
5. `InvestorLayout` **Reports nav**: add a `/investor/reports` route in `App.tsx`
   that renders `InvestorPortalPage` with `?view=reports` (or a dedicated
   reports tab inside the same page). Minimal implementation: nested route
   rendering a reports-focused section that reuses existing data
   (tax report + CSV export + recent payments).
6. `InvestorPortalPage` **"Invest Now"** → replace `<button>` with
   `<Link to="/deals">Browse Deals</Link>`.
7. `InvestorPortalPage` **Period tabs** → slice `portfolioHistory` based on
   `period` so the chart actually reacts.
8. Add **"Export CSV"** button in the header next to the Tax Report button.

None of these introduce new dependencies; all reuse `react-router-dom`,
`sonner` (already in `@/components/ui/sonner`), existing PDF gen, and
`Blob` / `URL.createObjectURL` for CSV.

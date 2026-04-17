# UI Audit — 2026-04-17

## Summary

**Total findings: 34 — critical: 6, major: 18, minor: 10.**

The CapitalBridge UI is broadly on-brand, but several categories of inconsistency
repeat across almost every page:

1. **Card radius is inconsistent** — the design system calls for `rounded-2xl` but
   most feature pages (Dashboard, Investor, Term Sheet, Construction, About, IT
   Instructions) ship cards using `rounded-xl`, and the login uses `rounded-3xl`.
2. **Typography scale drift** — 68 uses of arbitrary-value font sizes (`text-[11px]`,
   `text-[13px]`, `text-[15px]`, `text-[8px]`) bypass the Tailwind scale. This is
   visible as inconsistent metadata sizes across list rows, cards and panels.
3. **Gray tokens in badges** — `bg-gray-100 text-gray-500` is used in the
   `stageColors`, `ratingColors`, lifecycle, and term-sheet color maps instead of
   the project's slate tokens.
4. **Page-header rhythm is uneven** — Dashboard/Pipeline/Borrowers/Loan Book use
   `mt-2` subtitles but Screening/DD/Approvals/TermSheet/PIK/Construction/Map/Lifecycle
   use a tighter `mt-1` with `text-sm`. Same h1, two different breathing rooms.
5. **Raw hex colors leak into SVG/chart code** — six hex literals in `Index.tsx` and
   five in `InvestorPortalPage.tsx` encode slate/emerald/blue/violet directly instead
   of `hsl(var(--*))` tokens, making future theming impossible.
6. **About page ships Italian copy and Milan-themed branding in production UI** —
   visually shouts with red brand color and emojis that conflict with the rest of
   the product. (This is the largest single UX/visual inconsistency.)

The fixes recommended below focus on visual (not copy) issues — the `ux-designer`
pass owns copy and flow.

---

## Findings

### 1. Card radius inconsistent with design system (`rounded-xl` vs `rounded-2xl`)
- **Severity**: major
- **Category**: component
- **File**: `src/pages/Index.tsx:72, 106, 157, 220, 257, 276, 290`, `src/pages/InvestorPortalPage.tsx:147, 190, 229, 298, 324`, `src/pages/TermSheetPage.tsx:34`, `src/pages/AboutPage.tsx:29, 51, 66, 83, 102`, `src/pages/ITInstructionsPage.tsx:351`, `src/components/dashboard/DealCard.tsx:18`
- **Current**: `className="... rounded-xl ..."`
- **Proposed**: `className="... rounded-2xl ..."` to match AGENTS.md ("Cards: `rounded-2xl bg-slate-50 p-6`") and the pattern already used in `BorrowersPage.tsx`, `LoanBookPage.tsx`, `PIKEnginePage.tsx`, `BorrowerDetailPage.tsx`.

### 2. Login page uses `rounded-3xl` breaking the radius scale
- **Severity**: major
- **Category**: component
- **File**: `src/pages/LoginPage.tsx:89, 102, 151`
- **Current**: `rounded-3xl bg-white border border-slate-200 p-8`
- **Proposed**: `rounded-2xl` across all three login panels. `3xl` is used nowhere else in the app.

### 3. Stage/rating/lifecycle badges use `gray-*` tokens (not slate)
- **Severity**: major
- **Category**: color
- **File**: `src/data/sampleDeals.ts:113`, `src/data/borrowers.ts:72`, `src/data/termSheetData.ts:199`, `src/data/lifecyclePhases.ts:257`
- **Current**: `bg-gray-100 text-gray-500`
- **Proposed**: `bg-slate-100 text-slate-500` (and `text-slate-400` for the `skipped` lifecycle phase) — the rest of the app is on slate.

### 4. Raw hex colors inside dashboard donut chart
- **Severity**: major
- **Category**: color
- **File**: `src/pages/Index.tsx:226-230`
- **Current**: `<circle stroke="#f1f5f9" ... /> <circle stroke="#10b981" ... />` etc.
- **Proposed**: Move these to Tailwind classes via inline styles referencing CSS variables (`hsl(var(--muted))`, `hsl(var(--success))`, etc.), or to an `strokeClass` approach. At minimum, document them in a `tokens.ts` constant so recolor is one-touch.

### 5. Raw hex colors across investor chart
- **Severity**: major
- **Category**: color
- **File**: `src/pages/InvestorPortalPage.tsx:25-28, 173-183, 204, 208`
- **Current**: `color: "#19212E"`, `color: "#475569"`, `stroke="#19212E"`, `fill: "#94a3b8"`
- **Proposed**: Replace with references to CSS variables (`getComputedStyle(root).getPropertyValue('--primary')` at top of file, or an `allocationColors` constant in `tokens.ts`).

### 6. h1 subtitle spacing is inconsistent across page headers
- **Severity**: major
- **Category**: spacing
- **File**: `src/pages/ScreeningPage.tsx:10`, `src/pages/DueDiligencePage.tsx:66`, `src/pages/ApprovalsPage.tsx:84`, `src/pages/TermSheetPage.tsx:249`, `src/pages/ConstructionMonitoringPage.tsx:73`, `src/pages/LifecyclePage.tsx:34`, `src/pages/PIKEnginePage.tsx:42`, `src/pages/MapPage.tsx:10`, `src/pages/ITInstructionsPage.tsx:346`, `src/pages/AboutPage.tsx:25`
- **Current**: `<p className="text-slate-500 text-sm mt-1">...`
- **Proposed**: `<p className="text-slate-500 text-base mt-2">...` to match Dashboard/Pipeline/Borrowers/Loan Book/DealDetail/BorrowerDetail/InvestorPortal.

### 7. Arbitrary text sizes `text-[11px]`, `text-[13px]`, `text-[15px]`, `text-[8px]`
- **Severity**: major
- **Category**: typography
- **File**: 23 files, 68 occurrences — biggest offenders: `src/pages/Index.tsx` (15), `src/pages/TermSheetPage.tsx` (10), `src/components/deals/PIKSchedulePanel.tsx` (9), `src/pages/InvestorPortalPage.tsx` (4), `src/pages/LifecyclePage.tsx` (4), `src/components/dashboard/DealCard.tsx` (3). `InvestorPortalPage.tsx:270` even drops to `text-[8px]` for an Active pill.
- **Current**: `text-[11px]`, `text-[13px]`, `text-[15px]`, `text-[8px]`
- **Proposed**: Pick from the closed scale. For dense metadata: `text-xs` (12px). For small caps: `text-[0.625rem]` can become a reusable utility `.text-micro` — or better, keep `text-xs` uniformly and rely on `tracking-widest` / `uppercase` for visual distinction. Never go below `text-xs` — `text-[8px]` is illegible.

### 8. Dashboard event timeline uses random tag colors
- **Severity**: major
- **Category**: color
- **File**: `src/pages/Index.tsx:11-17, 318-325`
- **Current**: Each timeline event has its own hand-picked Tailwind palette (`bg-emerald-500`, `bg-blue-500`, `bg-amber-500`, `bg-violet-500`, `bg-rose-500`, with matching ring colors) and tag pills duplicate the mapping in a long ternary (`event.tag === "Funding" ? ... : event.tag === "Approval" ? ...`).
- **Proposed**: Extract to a `timelineTagConfig` object co-located with `timelineEvents`. Same pattern as `stageColors` so downstream devs can't accidentally add a new tag without a color.

### 9. Page-header action buttons have inconsistent padding
- **Severity**: major
- **Category**: component
- **File**: `src/pages/Index.tsx:63`, `src/pages/InvestorPortalPage.tsx:63, 69`, vs `src/pages/PipelinePage.tsx:38`, `src/pages/LoanBookPage.tsx:58`, `src/pages/BorrowersPage.tsx:59`
- **Current**: Dashboard/Investor use `py-3`, Pipeline/LoanBook/Borrowers use `py-2.5`
- **Proposed**: Unify on `py-2.5` — matches the primary accent button app-wide and Top Nav "Add New Deal".

### 10. Dashboard hero headline mixes `font-extrabold` and `font-bold`
- **Severity**: major
- **Category**: typography
- **File**: `src/pages/Index.tsx:80, 111, 115, 233`
- **Current**: NAV hero uses `font-extrabold`; Portfolio Diversity splits `font-extrabold` (active deals) and `font-bold` (avg rate) side-by-side. `text-[11px] font-extrabold` for the donut center label.
- **Proposed**: Pick one weight per hierarchy level. Hero numbers: `font-bold` (to match the rest of the app's h1 `font-bold`). `font-extrabold` should be reserved for the landing page hero only.

### 11. EmptyState radius does not match enclosing list cards
- **Severity**: minor
- **Category**: component
- **File**: `src/components/LoadingSkeleton.tsx:49`
- **Current**: `rounded-2xl bg-slate-50 p-10` — correct shape.
- **Proposed**: Good, but add `border border-dashed border-slate-200` or at least a subtle border so the empty state reads as a placeholder rather than a filled card. Right now it looks like a "section" on BorrowersPage where the table would otherwise be.

### 12. LoadingSkeleton uses `rounded-xl` while real cards use `rounded-2xl`
- **Severity**: minor
- **Category**: component
- **File**: `src/components/LoadingSkeleton.tsx:13, 21`
- **Current**: `rounded-xl border border-slate-200`
- **Proposed**: `rounded-2xl` so loading placeholders match the final card radius.

### 13. Metric cards on DealDetail have different radius than other pages
- **Severity**: major
- **Category**: component
- **File**: `src/components/deals/DealDetail.tsx:198`
- **Current**: `<div className="rounded-lg border border-slate-100 bg-white p-3 ...">` for each of the 6 key metric tiles
- **Proposed**: Use the project's metric-card pattern (`rounded-2xl bg-slate-50 p-6`) as in LoanBook/Borrowers/PIKEngine. Currently the deal-detail metrics are the smallest, boxiest, and most visually distinct from the rest of the app.

### 14. Not-found page uses emerald link color, not accent
- **Severity**: major
- **Category**: color
- **File**: `src/pages/NotFound.tsx:9`
- **Current**: `text-emerald-600 underline hover:text-emerald-700`
- **Proposed**: `text-accent hover:text-accent/80` — emerald is reserved for success/positive amounts, not navigation.

### 15. Landing page invokes emerald "underline bar" decoration on the hero word
- **Severity**: minor
- **Category**: color
- **File**: `src/pages/LandingPage.tsx:190`
- **Current**: `bg-gradient-to-r from-emerald-500 to-transparent`
- **Proposed**: Use `from-accent` so the brand color (indigo/violet) carries through the hero, not emerald. (Emerald is used for "LIVE" status, positive returns, and up arrows — not for decoration.)

### 16. About page ships a Milan-branded hero in production
- **Severity**: critical
- **Category**: color / component
- **File**: `src/pages/AboutPage.tsx:29, 44, 52-53, 68, 73, 75, 100-101, 109, 116, 128`
- **Current**: Hero gradient bleeds `bg-red-500/10`, all value cards use `bg-red-50`/`text-red-600`, team avatars on `from-red-600 to-red-800`, emoji `🔴⚫`, `🏟️`. The page is Italian and invents a "Stadio preferito" contact row.
- **Proposed**: Swap `red-*` for accent/slate tokens (`bg-accent/10`, `text-accent`), remove emoji, translate copy to English (coordinated with `ux-designer`). This is the single largest visual inconsistency in the app — the rest of CapitalBridge is institutional/neutral while this page is a football-fan zine.

### 17. ITInstructionsPage uses `<pre>` for long body copy
- **Severity**: major
- **Category**: typography
- **File**: `src/pages/ITInstructionsPage.tsx:359`
- **Current**: `<pre className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-body">{section.content}</pre>`
- **Proposed**: `<pre>` renders in monospace by default. The `font-body` class applies Inter, but `<pre>` still disables ligatures/kerning and the ASCII separators (`═══`) look like leftover dev output. Render as `<div>` with `whitespace-pre-wrap` + normal paragraph styling, and move headings inside into real `<h3>` elements.

### 18. Sidebar active item uses non-standard pill shape
- **Severity**: minor
- **Category**: component
- **File**: `src/components/layout/AppLayout.tsx:84-89`
- **Current**: `rounded-full ... bg-accent text-white shadow-sm shadow-accent/20`
- **Proposed**: The pill navigation is fine, but `px-4 py-2` produces an oval too wide for the 260px sidebar on smaller widths. Consider `rounded-xl` for sidebar items — keeps the brand's pill elsewhere (buttons, filters) distinct from navigation.

### 19. Sidebar nav label font is a magic size
- **Severity**: minor
- **Category**: typography
- **File**: `src/components/layout/AppLayout.tsx:74, 84`
- **Current**: Group labels use `text-[10px]`; item links use `text-[13px]`.
- **Proposed**: Group labels: `text-[0.6875rem]` → standardize on `text-[11px]` alias or a `.text-eyebrow` utility. Item links: `text-sm` (14px) is already close to 13px and reads cleanly.

### 20. Top nav notification dot overlaps icon
- **Severity**: minor
- **Category**: accessibility
- **File**: `src/components/layout/AppLayout.tsx:213`, `src/components/layout/InvestorLayout.tsx:76`
- **Current**: `<span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />` — positioned inside the `p-2.5` icon button, so the dot sits partially over the bell.
- **Proposed**: `top-1.5 right-1.5` and add `ring-2 ring-white` to separate the dot from the bell glyph.

### 21. Stage-change inline confirmation banner is borderless on dark mode-prep
- **Severity**: minor
- **Category**: component
- **File**: `src/components/deals/DealDetail.tsx:129, 152`
- **Current**: Stage change uses `bg-accent/5 border-accent/20`; delete confirm uses `bg-red-50 border-red-200`.
- **Proposed**: Delete confirm should use `bg-destructive/5 border-destructive/20` to match the rest of the app's destructive semantic tokens. Right now it's the only place that short-circuits to raw red.

### 22. DealDetail tabs list has 13 tabs on one row — wraps unevenly
- **Severity**: major
- **Category**: responsive
- **File**: `src/components/deals/DealDetail.tsx:211-225`
- **Current**: `<TabsList className="bg-muted border border-slate-100 flex-wrap h-auto gap-1 p-1">` with 13 triggers.
- **Proposed**: Either (a) group related tabs into sub-sections with a two-tier nav, or (b) use horizontal scroll (`overflow-x-auto` + `flex-nowrap`) so the user scrolls tabs instead of wrapping into 2-3 rows. 13 tabs in a flex-wrap is messy on `lg:` (each row 6-7, last row 1-2).

### 23. Approvals page uses `rounded-xl` for per-deal cards while DD/Construction/TermSheet use `rounded-2xl`
- **Severity**: major
- **Category**: component
- **File**: `src/pages/ApprovalsPage.tsx:38`
- **Current**: `<div className={cn("rounded-xl border bg-card ...", borderClass)}>`
- **Proposed**: `rounded-2xl` to match `DueDiligencePage.tsx:21`, `ConstructionMonitoringPage.tsx:36`, `LifecyclePage.tsx:123`.

### 24. Sorted table rates/LTV/etc. are left-aligned, breaking number scanning
- **Severity**: major
- **Category**: typography
- **File**: `src/pages/LoanBookPage.tsx:158-173`
- **Current**: All data columns (`Facility`, `Disbursed`, `PIK Accrued`, `Rate`, `LTV`, `Maturity`) use the default left alignment. Headers use `px-6 py-3` without `text-right`.
- **Proposed**: Financial tables should right-align numbers (`text-right tabular-nums`) as already done in `BorrowerDetailPage.tsx` and `PIKEnginePage.tsx`. Loan Book is the flagship table and currently reads awkwardly.

### 25. DealCard metric labels use `font-medium`, values use `font-bold` — but all on the same line
- **Severity**: minor
- **Category**: typography
- **File**: `src/components/dashboard/DealCard.tsx:42, 46, 50, 54`
- **Current**: `<p className="text-xs text-slate-400 font-medium">LTV</p><p className="text-sm font-bold ...">...</p>`
- **Proposed**: Correct pattern, but the `text-xs font-medium` label at 12px is nearly invisible next to the 14px value. Use `text-[0.625rem] uppercase tracking-widest text-slate-400 font-semibold` to match the dashboard "eyebrow" style or drop to `tracking-wide` for readability.

### 26. Dashboard donut center label reads "100%" (useless, and small-caps)
- **Severity**: minor
- **Category**: hierarchy
- **File**: `src/pages/Index.tsx:233`
- **Current**: `<span className="text-[11px] font-extrabold text-primary">100%</span>`
- **Proposed**: Either show the primary sector share (e.g. "42%") or remove the center label entirely. Always-100% is uninformative.

### 27. Disabled-looking metrics on DealFormDialog computed fields use `bg-muted` with black text
- **Severity**: minor
- **Category**: accessibility
- **File**: `src/components/deals/DealFormDialog.tsx:365, 402, 406`
- **Current**: `<Input value={...} disabled className="bg-muted" />`
- **Proposed**: Disabled inputs inherit `opacity-50` from the Input primitive but the `bg-muted` override removes the contrast drop. Use `bg-slate-100 text-slate-600 cursor-not-allowed` for a read-only-computed state that doesn't look broken.

### 28. Login page CTA "Sign up" in top nav has `py-2.5` but landing hero CTA uses `py-4`
- **Severity**: minor
- **Category**: component
- **File**: `src/pages/LandingPage.tsx:147, 205`
- **Current**: Nav "Sign up" at `px-5 py-2.5`; hero "Get started" at `px-7 py-4`.
- **Proposed**: Acceptable for hero emphasis, but align nav and hero on the same height class set (`py-2.5` for small, `py-3.5` for hero). `py-4` on a pill of height ~h-12 is the tallest button in the whole app.

### 29. PIKEngine table uses `text-primary` on `hover:text-primary` — no visible feedback
- **Severity**: minor
- **Category**: accessibility
- **File**: `src/pages/PIKEnginePage.tsx:79`
- **Current**: `<Link to={...} className="font-medium text-primary hover:text-primary transition-colors">`
- **Proposed**: `hover:text-accent` for hover state — otherwise the link looks non-clickable.

### 30. LifecycleProgressBar segment gap leaves visible white between bars
- **Severity**: minor
- **Category**: component
- **File**: `src/components/deals/LifecycleProgressBar.tsx:11`
- **Current**: `flex items-center gap-0.5` — 2px gap between 12 phase segments.
- **Proposed**: Either remove the gap (`gap-0`) for a continuous bar or bump to `gap-1` so the segmentation is visible. `gap-0.5` (2px) is on the edge of perception and looks like a rendering bug.

### 31. LegalSecurityPanel CP-status icons don't get rendered (object defined, never used)
- **Severity**: minor
- **Category**: component
- **File**: `src/components/deals/LegalSecurityPanel.tsx:19-24`
- **Current**: `cpStatusConfig` includes `icon` keys, but the component renders only `label` + `className`. Dead code.
- **Proposed**: Either render the icons in the CP list (better visual feedback) or remove the `icon` fields. Currently import-bloat of `Clock`, `AlertTriangle`, `CheckCircle2` for unused icons.

### 32. Borrower detail tabs include both a KYC badge and a progress bar for the same info
- **Severity**: minor
- **Category**: hierarchy
- **File**: `src/pages/BorrowerDetailPage.tsx:258-274`
- **Current**: Progress bar at 100% + "ALL CLEAR" badge side-by-side.
- **Proposed**: Collapse the duplicate. When `allKycValid`, hide the progress bar and lead with the badge; otherwise show the progress bar only.

### 33. Typography — h1 uses `mb-1`/`mb-2` subtitle breathing, but Dashboard big h2 uses `mt-3`
- **Severity**: minor
- **Category**: spacing
- **File**: `src/pages/Index.tsx:80`, `src/pages/InvestorPortalPage.tsx:83`
- **Current**: Dashboard NAV: `<h2 className="text-4xl font-extrabold tracking-tight">` with the LIVE pill on `mb-3` above. Investor portal: `<h2 className="text-5xl font-bold tracking-tight mt-3">` — two different scale and top margins.
- **Proposed**: Match both to `text-4xl font-bold tracking-tight` (h2 default) and `mb-3` above for the label.

### 34. Sidebar user avatar uses `rounded-2xl` for its container but `rounded-full` for avatar
- **Severity**: minor
- **Category**: component
- **File**: `src/components/layout/AppLayout.tsx:137`
- **Current**: `<div className="flex items-center gap-3 px-2 py-2 rounded-2xl hover:bg-slate-50 transition-colors">`
- **Proposed**: The outer hover container should be `rounded-full` to match sidebar item shape (or `rounded-xl` if we accept recommendation #18). Mixed radii in the same small region read as inconsistency.

---

## Notes on scope

- Findings #16 (About page Milan theme) and #14/#15 (emerald as navigation color)
  **cross with UX** — the `ux-designer` pass should also address the copy/emoji
  side of them. This file only discusses the visual/color/component aspect.
- No accessibility contrast failures were found against WCAG AA on primary copy;
  the `text-slate-400` labels on white (~3.1:1) pass AA for large UI text but are
  on the edge for small body copy. Not flagged individually — systemic.
- Arbitrary font sizes (finding #7) are the most pervasive issue and would benefit
  from a codemod rather than individual fixes.

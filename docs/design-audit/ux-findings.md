# UX Audit — 2026-04-17

## Summary

Total findings: **24** (critical: 5, major: 12, minor: 7)

CapitalBridge has a solid product shell with good information architecture, consistent
navigation, and functional empty states on most list pages. The main gaps sit at the
emotional/narrative layer: (1) the brand voice is inconsistent — AboutPage reads as a
personal Italian football blog, the IT Instructions page is entirely in Spanish, and the
landing page mixes finance copy with informal tone; (2) destructive and irreversible
actions are confirmed by inline cards rather than modal dialogs, which the user can
easily miss; (3) several mutations (stage advance, term sheet actions) give feedback
only via toasts but don't guide the user to the logical next step; (4) form-level
validation and microcopy leans generic ("Error: Unknown error", "Submit") rather than
specific and actionable; (5) the Investor Portal's primary CTA "Invest Now" is a dead
link with no affordance, setting up a trust-breaking first impression for LPs.

Most findings are cheap to fix (copy, confirmations, empty-state CTAs). The top 5 are
addressed in the companion PR; the rest are left for follow-up.

## Findings

### 1. About page breaks institutional voice completely
- **Severity**: critical
- **Category**: tone
- **Page**: `src/pages/AboutPage.tsx`
- **Current**: Page is written in Italian, references AC Milan in the subtitle ("perché il Milan vincerà la Champions"), uses red/black team colors instead of the brand accent, includes emoji soccer flags, a jokey "Champions del Milan" stat card, and a "Stadio preferito: San Siro" contact block. A CastleLake LP or first-time prospect landing here would immediately lose trust in the platform.
- **Proposed**: Rewrite in English using the institutional voice already present on LandingPage. Keep team, mission, values, and stats — remove all football references, emojis, Italian copy, and red team palette. Mission should describe the Clikalia/CastleLake fund thesis in two calm, confident paragraphs.

### 2. Investor Portal "Invest Now" CTA is dead and erodes trust
- **Severity**: critical
- **Category**: journey
- **Page**: `src/pages/InvestorPortalPage.tsx`
- **Current**: The primary CTA in the header — a high-emphasis accent button labeled "Invest Now" — has no `onClick` and no `href`. An LP clicking it sees nothing happen. For an investor portal, the single most important button being broken is a first-impression disaster.
- **Proposed**: Either remove it until capital-call flow exists, or relabel to "Request allocation" and wire to a `mailto:` or a simple toast explaining that allocation requests go through the fund manager. At minimum it must give the user *some* response.

### 3. IT Instructions page is entirely in Spanish with no English option
- **Severity**: critical
- **Category**: tone
- **Page**: `src/pages/ITInstructionsPage.tsx`
- **Current**: Accessible from the main nav as "Instrucciones para IT". Despite the CLAUDE.md convention that "UI language: English", this 300+ line reference doc is entirely in Spanish. International users or CastleLake reviewers cannot read it.
- **Proposed**: Either translate to English (primary fix) or move this page out of the main app nav into a `docs/` internal-only location. It reads as dev notes, not product content — it probably shouldn't be in the sidebar at all.

### 4. Delete confirmation is inline, not modal — high risk of accidental deletion
- **Severity**: critical
- **Category**: feedback
- **Page**: `src/components/deals/DealDetail.tsx`
- **Current**: Clicking the trash icon reveals an inline red-tinted banner with "Cancel"/"Delete" buttons at the top of the page. The `Delete` button is active on first render — one misclick on a fast connection wipes a multi-million-euro facility with no undo. The same pattern is used for stage change. There is no confirmation modal, no typed confirmation, and no "type project name to confirm" friction.
- **Proposed**: Use `AlertDialog` (already in shadcn/ui) for destructive actions. Body should say "This will permanently delete [Project Name] and all its sub-records (DD items, approvals, term sheets, waivers, monitoring data). This cannot be undone." Require the user to type the project name for high-value deals, or at minimum make the destructive button the non-default focus target.

### 5. Login role chooser loses context when user goes "back"
- **Severity**: major
- **Category**: journey
- **Page**: `src/pages/LoginPage.tsx`
- **Current**: After a user picks "Platform" vs "Investor" and fills email/password, the small "Switch to Investor/Platform" link clears the form state with no warning. A user who typed credentials and selected the wrong role loses their typing.
- **Proposed**: Preserve email across mode switches (it's the same for both); only clear password. Or add a tooltip "You'll re-enter your email" on the switch link. Smaller win: make the role choice visible during login so users can see which lane they're in without having to switch modes.

### 6. Reset password success bounces user to login without explanation
- **Severity**: major
- **Category**: feedback
- **Page**: `src/pages/ResetPasswordPage.tsx`
- **Current**: After a successful password update, the page calls `toast.success("Password updated successfully!")` and immediately `window.location.href = "/login"`. The toast fires right before the hard nav — the user likely never sees it, and they land on login wondering why they were logged out.
- **Proposed**: Show an inline success state for 2-3 seconds ("Password updated. Redirecting you to sign in…") with a manual "Sign in now" link, then redirect. Or render a dedicated success card (like the "Check your email" card already in the same file) with a "Sign in" button.

### 7. Error toast "Error: Unknown error" blames the user and leaks Error type
- **Severity**: major
- **Category**: microcopy
- **Page**: `src/components/deals/DealFormDialog.tsx`, `src/components/borrowers/BorrowerFormDialog.tsx`
- **Current**: Both dialog mutations end with `toast.error(\`Error: ${err instanceof Error ? err.message : "Unknown error"}\`)`. When the network fails or Supabase returns a generic error the user sees "Error: Unknown error" — zero help, zero reassurance that the product is okay, and no guidance on what to do.
- **Proposed**: Swap to "We couldn't save this deal. Please check your connection and try again." and log the original error via Sentry. Keep a secondary "Details" affordance for power users if needed.

### 8. Stage-advance banner is easy to miss and has no "skip to" affordance
- **Severity**: major
- **Category**: journey
- **Page**: `src/components/deals/DealDetail.tsx`
- **Current**: When the user clicks "Advance to Due Diligence", a subtle accent-tinted banner appears below the header. It's visually similar to the other info cards on the page, and on a long scrolled view the user may not notice it opened at the top. There's also no way to skip intermediate stages or go back a stage.
- **Proposed**: Use an `AlertDialog` for stage transition too — this is a semi-destructive write with business implications (triggers notifications, DD checklist generation, audit log). Include copy explaining what happens on the other side ("Moving to Due Diligence will generate the DD checklist and notify the analyst team"). Add a "Reject deal" escape hatch for analysts who decide not to proceed.

### 9. "Advance to X" button gives no preview of what "X" triggers
- **Severity**: major
- **Category**: microcopy
- **Page**: `src/components/deals/DealDetail.tsx`
- **Current**: The "Advance to Due Diligence" / "Advance to IC Approval" etc. buttons show only the target stage. A new originator doesn't know what business events are triggered by each transition.
- **Proposed**: When the confirmation dialog opens, add a "What happens next" bullet list. E.g. for Due Diligence: "A DD checklist will be generated", "The analyst will be notified", "The borrower's KYC record will be re-verified". This is doable from static mapping.

### 10. Form error messages say "Must be positive" with no context
- **Severity**: major
- **Category**: microcopy
- **Page**: `src/components/deals/DealFormDialog.tsx`
- **Current**: Zod errors surface as "Must be positive" or "Required". Users see a red sentence under a field with no guidance on correct format or sensible ranges. For a finance tool, it would help to hint the realistic band (e.g. "Loan amount usually €5M–€25M").
- **Proposed**: Rewrite messages to be specific: "Loan amount must be greater than €0" instead of "Must be positive". Add placeholder hints in inputs: `placeholder="e.g. 12,500,000"` for loan amount, `placeholder="e.g. 24"` for tenor.

### 11. "Advance to X" is non-reversible but presented as casual
- **Severity**: major
- **Category**: feedback
- **Page**: `src/components/deals/DealDetail.tsx`
- **Current**: No visual or copy cue that stage-advance logs to the audit trail and will be visible to the CastleLake side. Originators may click casually, not realizing their name is attached permanently.
- **Proposed**: Stage-change dialog should say "This action will be logged in the audit trail and visible to the Capital Partner." near the confirm button. Builds professional trust.

### 12. Loan Book has no "view/open" column affordance — whole row is a link
- **Severity**: major
- **Category**: journey
- **Page**: `src/pages/LoanBookPage.tsx`
- **Current**: The project name is clickable but the rest of the row is not. A user scanning a row and clicking on the Rate or LTV cell to "drill in" gets no response. On a dense table this is a usability surprise.
- **Proposed**: Either make the entire row clickable (linking to `/deals/[id]`) with a visible hover state and an explicit "View →" column on the right, or keep just the project-name link but add `cursor-pointer` hover cue only on the link column. Consistency > ambiguity.

### 13. DueDiligencePage hides deals with zero items — appears broken
- **Severity**: major
- **Category**: journey
- **Page**: `src/pages/DueDiligencePage.tsx`
- **Current**: `DealDDRow` returns `null` when `items.length === 0`. If the page has 6 deals but only 2 have DD items configured, the user sees 2 rows with no explanation for the missing 4. It looks like a bug.
- **Proposed**: Render all active deals; for those with 0 items, show a compact row with "No DD items — start checklist" CTA that generates or links to DD setup. Or show a count at top: "Showing 2 of 6 active deals with DD items in progress".

### 14. "No deals yet" empty state on Approvals page nudges to Pipeline, not "New Deal"
- **Severity**: minor
- **Category**: journey
- **Page**: `src/pages/ApprovalsPage.tsx`
- **Current**: Empty state says "Go to Pipeline" — but from Pipeline, an empty user still has to click New Deal. One extra step, and from Approvals the user probably wanted the deal to already exist.
- **Proposed**: Replace with a two-option block: "Create a deal" (opens `DealFormDialog` directly) *and* "Go to Pipeline" (if they want to browse first).

### 15. Drawdown status microcopy is inconsistent with the rest of the app
- **Severity**: minor
- **Category**: microcopy
- **Page**: `src/components/deals/DealDetail.tsx` (drawdowns tab)
- **Current**: Status labels come from `.charAt(0).toUpperCase() + .slice(1)` so you get "Disbursed" / "Approved" / "Requested" / "Pending" — but the rest of the app uses ALL-CAPS badge labels like "COMPLETED", "PROCESSING". Inconsistent visual language.
- **Proposed**: Standardize on one style across all status badges (sentence case is cleaner and reads faster — so align the Dashboard's "COMPLETED"/"PROCESSING" to sentence case too).

### 16. "Compliance Notice" card on dashboard is static mock copy
- **Severity**: major
- **Category**: trust
- **Page**: `src/pages/Index.tsx`
- **Current**: Amber-bordered card saying "Quarterly asset valuation audits are scheduled for next Monday. Ensure documentation is current." — hardcoded, never updates, shown regardless of actual state. A user reading it two weeks later will wonder why it still says "next Monday".
- **Proposed**: Either wire to a real feed (upcoming milestones from deals) or remove entirely. If kept as demo-only placeholder, mark clearly (e.g. "Demo content — configure in settings").

### 17. Landing page has placeholder nav links that go nowhere
- **Severity**: minor
- **Category**: trust
- **Page**: `src/pages/LandingPage.tsx`
- **Current**: Nav items "Features", "How it works", "Investors", "Pricing" are all `<a href="#">`. Clicking any jumps to top of page with no feedback. For a marketing page this reads as an unfinished site.
- **Proposed**: Either remove the nav items or anchor them to actual sections further down the page. Add stub sections if needed.

### 18. Borrower list shows "Rated A" metric without explanation
- **Severity**: minor
- **Category**: microcopy
- **Page**: `src/pages/BorrowersPage.tsx`
- **Current**: The second summary card just says "Rated A" with a number. A new user doesn't know what A/B/C/D means or why A is highlighted in accent color vs others.
- **Proposed**: Add a tooltip or inline hint: "Rated A (lowest risk)" — or rename to "A-rated borrowers" for clarity. Consider a legend elsewhere on the page.

### 19. Loading states are inconsistent: skeleton vs spinner vs nothing
- **Severity**: minor
- **Category**: feedback
- **Page**: multiple (`DealDetailPage.tsx`, `Index.tsx`, subdata hooks)
- **Current**: Most pages use `LoadingSkeleton`, but DealDetailPage uses a centered spinner, and sub-panels (DueDiligencePanel, ApprovalsPanel) also show a spinner only. The switch between skeleton and spinner feels like a layout shift.
- **Proposed**: Unify — use skeleton for full pages, use the small spinner only for in-panel async operations (upload progress, mutation in-flight). Document the rule.

### 20. File upload button shows "Uploaded {filename}" — loses file reference
- **Severity**: minor
- **Category**: feedback
- **Page**: `src/components/ui/FileUploadButton.tsx`
- **Current**: After upload, toast says "Uploaded example.pdf" but the UI doesn't change; the button still says "Attach". The user may upload the same file twice by accident.
- **Proposed**: After success, briefly show "Attached" on the button for 3 seconds before reverting, and update the attachment count next to the item. Either disable re-upload on a single item or warn on duplicate filenames.

### 21. Sign up success toast shows but user sits on the same form
- **Severity**: major
- **Category**: journey
- **Page**: `src/pages/LoginPage.tsx`
- **Current**: After signup, toast says "Account created! Check your email to confirm, then sign in." — but the signup form stays mounted with the same values. The user might click Submit again thinking it failed.
- **Proposed**: Replace the form with a dedicated "Check your email" card (like reset-password `step === "sent"`). Show the email address, a "Resend email" link, and a "Go to sign in" button.

### 22. Lifecycle page uses unicode glyphs for status (inconsistent with icon system)
- **Severity**: minor
- **Category**: accessibility
- **Page**: `src/pages/LifecyclePage.tsx`, `src/components/deals/LifecycleTracker.tsx`
- **Current**: Milestone blocks and blocker blocks mix Lucide icons with unicode check/warning glyphs: "All milestones achieved ✓", "⚠ {phase.name}". Screen readers read these inconsistently, and the visual rendering depends on OS font. The rest of the app uses Lucide's `CheckCircle2` and `AlertTriangle`.
- **Proposed**: Replace unicode glyphs with the same Lucide icons used elsewhere. Consistency + accessibility.

### 23. Covenant alert pill on DealDetail header has no next-step CTA
- **Severity**: major
- **Category**: journey
- **Page**: `src/components/deals/DealDetail.tsx`
- **Current**: A prominent amber "Covenant Alert" pill appears in the header but isn't clickable. A portfolio manager seeing this has to scroll down and find the covenants tab manually.
- **Proposed**: Make the pill a button that switches the tab to Covenants (`setActiveTab("covenants")`). Or at minimum style it as a link with hover affordance.

### 24. DueDiligencePanel empty-state copy is helpful but CTA missing
- **Severity**: minor
- **Category**: journey
- **Page**: `src/components/deals/DueDiligencePanel.tsx`
- **Current**: Empty state reads "Due diligence checklists are generated when a deal advances to the DD stage. Move the deal forward to start tracking findings." — that's good copy, but there's no button to actually advance the deal from this view.
- **Proposed**: Add a secondary CTA "Advance to Due Diligence" if the current stage is `screening`. Otherwise point the user to the deal's stage advance button at the top.

## Notes for follow-up

- Empty-state copy across the app is generally good (Pipeline, Loan Book, Borrowers, Approvals, DueDiligence, TermSheet, Construction, Lifecycle all have reasonable empty states with CTAs). This is a strong foundation — most fixes here are polish, not rewrites.
- The brand voice reset (About page, IT Instructions, Landing nav) is the biggest single lift and should be prioritized before any investor-facing demo.
- Destructive action patterns (stage change, delete) would benefit from a centralized `<ConfirmDestructiveDialog>` primitive used across deals, borrowers, waivers, and future features.
- A designer pass on icon/status consistency (item 15 + 22) is worth doing once for the whole app rather than per-page.
- "Crosses with UI" — items 15 (status badge visual style) and 22 (icon glyph consistency) have visual design implications; ui-designer should sanity-check.

# Admin (Fund Manager) Guide

## Who this is for

The fund manager and senior operators who sign off deals, manage users, and
deliver reporting to the capital partner (Castlelake).

## What you see

Admins can access every page. Day-to-day you will use:

- **Overview** — daily KPIs and timeline
- **Approvals** — IC votes and capital-partner sign-offs
- **Term Sheets** — key-terms review and waiver approvals
- **Loan Book** — full exposure view with Excel export
- **Pipeline** — forward deal flow
- **Borrowers** — sponsor base, KYC health
- **Due Diligence**, **Construction**, **Lifecycle** — oversight across deals
- **PIK Engine** — portfolio-wide interest accrual

## Common workflows

### 1. Approve a deal at IC

1. Open **Approvals**.
2. Under *Pending Approval*, find the deal row (amber header).
3. Review the approval panel — votes, quorum, capital-partner status.
4. Cast your vote. Once the quorum is reached the deal moves to *Completed*.

### 2. Approve or reject a waiver

1. Open **Term Sheets**.
2. Find the deal and check the waiver indicators on the card.
3. Click through to the deal detail page and open the term-sheet / waiver panel.
4. Approve or reject. Waivers need both internal and capital-partner approval.

### 3. Promote a new user

1. New signups start as `viewer` (set by the `handle_new_user` trigger in
   `supabase/migrations/00003_fix_auth_trigger.sql`).
2. In the Supabase dashboard → **Authentication** → find the user.
3. Update their `role` in `profiles` to `analyst`, `portfolio_manager`,
   `investor`, or `admin`.
4. The change takes effect on next login.

### 4. Export reporting for the capital partner

1. **Loan Book** → filter *Active* → **Export to Excel**.
2. **Pipeline** → **Export Excel** for forward pipeline.
3. Open a specific deal and use **PDF Report** on **Due Diligence** or
   **Print PDF** on **Term Sheets**.
4. **Investor Portal** → **Tax Report** generates the LP-facing summary.

### 5. Delete a record

1. Only admins can delete — enforced in RLS
   (`get_user_role() = 'admin'` in `supabase/migrations/00001_initial_schema.sql`).
2. Deletion actions appear on relevant entity detail pages.
3. Every delete is captured in `audit_logs`.

## What you can't do

You are the `admin` database role — effectively unrestricted. Soft constraints:

- **Role promotion** is a Supabase dashboard action, not an in-app form yet.
- **Database schema** changes must go through `supabase/migrations/*`.
- Auth and RLS files are on the "DO NOT TOUCH" list in `AGENTS.md`.

## FAQ

**Q: How do I audit who changed what?**
A: Every create and update writes to `audit_logs` via mutations in
`src/hooks/useSupabaseQuery.ts`. Query from Supabase.

**Q: Where are the sample data and initial users?**
A: Seeded by `supabase/migrations/00002_seed_data.sql`. User defaults live in
`supabase/migrations/00003_fix_auth_trigger.sql`.

**Q: How do I give an investor access only to their own portfolio?**
A: Set their `role` to `investor`. They land on **Investor Portal** via
`InvestorLayout`.

**Q: Can I run the app without Supabase?**
A: Yes — if `VITE_SUPABASE_URL` is unset, the app runs in demo mode with mock
data, controlled by `isSupabaseConfigured()` in `src/lib/supabase.ts`.

**Q: What is the approval quorum?**
A: Defined per deal in `approval_records` and `ic_votes`. See the Approvals
panel on a deal for the live vote count.

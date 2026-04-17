# Finance Team Guide

## Who this is for

Finance team members who monitor the active loan book — exposure, interest accrual,
covenants, drawdowns, and the numbers the fund reports to investors.

## What you see

Your daily sections:

- **Overview** — portfolio KPIs, NAV, pipeline volume, recent activity
- **Loan Book** — the single table of all active and historical loans
- **PIK Engine** — monthly interest accrual and exposure projection
- **Lifecycle** — where each deal sits in the 12-phase workflow
- **Approvals** — pending and completed IC / capital-partner sign-offs
- **Investor Portal** — preview of what LPs see and the tax report PDF

## Common workflows

### 1. Daily loan book review

1. Click **Loan Book**.
2. Use the stage chips at the top to switch between *Active*, *Documentation*,
   *Repaid*, etc.
3. Sort by clicking **Facility**, **Rate**, **LTV**, or **Maturity**.
4. LTV values above 65% show in amber — covenant watch.
5. Click **Export to Excel** (top-right) for the current filtered table.

### 2. Check interest accrual

1. Open **PIK Engine**.
2. Summary tiles show *Total Principal Outstanding*, *Total PIK Accrued*,
   *Total Exposure*, and *Active Deals*.
3. The per-deal table lists monthly accrual, projected PIK at maturity, and
   projected exposure at maturity.
4. Click a project name to see the full month-by-month PIK schedule.

### 3. Monitor covenant breaches

1. On **Overview**, scan the timeline — breach alerts have an amber icon.
2. Open the deal from **Loan Book** and review the Covenants section.
3. Real-time toasts fire on breaches in live mode
   (see `src/hooks/useRealtimeNotifications.ts`).

### 4. Track drawdowns and disbursements

1. Open **Lifecycle** to see which phase each deal is in.
2. Click **View detail** to see scheduled drawdowns, disbursed amount, and
   next milestones.
3. Compare *Disbursed* vs *Facility* on **Loan Book** to spot undrawn commitments.

### 5. Prepare period-end reporting

1. On **Loan Book**, filter *Active* and click **Export to Excel**.
2. On **Pipeline**, click **Export Excel** for forward pipeline.
3. On **Investor Portal**, use **Tax Report** to generate the LP-facing PDF.

## What you can't do

You are mapped to the `portfolio_manager` database role.

- **Allowed**: read everything; create and edit deals, covenants, drawdowns,
  monitoring reports, and most operational records.
- **Denied**: cannot **delete** records (admin only); cannot promote users.
  Final IC approval is the Admin's call.

## FAQ

**Q: How is PIK calculated?**
A: Monthly on (principal + accrued PIK). Both cash interest and PIK spread are
capitalised each period — full-PIK. Logic in `src/data/pikEngine.ts`.

**Q: Can I adjust a drawdown schedule?**
A: Yes, from the deal detail page. The change is audited in `audit_logs`.

**Q: Where do I check covenant thresholds?**
A: On each deal's detail page, under the Covenants panel. Standard limits:
LTV ≤65%, LTC ≤75%, pre-sales ≥30%.

**Q: Do I need to refresh to see new data?**
A: No. Real-time subscriptions push covenant, stage, and approval changes as
toast notifications.

**Q: How do I get data into the fund's accounting system?**
A: Export Excel from **Loan Book** or **Pipeline**, or the PDF tax report from
**Investor Portal**.

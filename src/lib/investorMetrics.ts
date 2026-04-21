import type { Deal } from "@/data/sampleDeals";
import { generatePIKSchedule, type PIKScheduleEntry } from "@/data/pikEngine";

// Month label shown in charts ("Jul", "Aug", ...)
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Build a deal's PIK schedule if it has enough data; returns [] when
// firstDrawdownDate is missing (e.g. screening-stage deals).
function scheduleForDeal(deal: Deal): PIKScheduleEntry[] {
  if (!deal.firstDrawdownDate || !deal.tenor) return [];
  const pik = generatePIKSchedule({
    dealId: deal.id,
    loanAmount: deal.loanAmount,
    cashRate: deal.interestRate,
    pikSpread: deal.pikSpread,
    tenor: deal.tenor,
    firstDrawdownDate: deal.firstDrawdownDate,
    drawdowns: deal.drawdowns ?? [],
  });
  return pik.schedule;
}

export interface PortfolioHistoryPoint {
  month: string;
  value: number;
  returns: number;
}

// Aggregate historical NAV per month across deals, ending at the current month
// and reaching back `months` periods.
export function buildPortfolioHistory(deals: Deal[], months: number, today: Date = new Date()): PortfolioHistoryPoint[] {
  const points: PortfolioHistoryPoint[] = [];
  const schedules = deals.map(scheduleForDeal);

  for (let offset = months - 1; offset >= 0; offset--) {
    const target = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    const targetKey = target.toISOString().slice(0, 7);

    let exposure = 0;
    let pikToDate = 0;
    for (const schedule of schedules) {
      // Find the entry matching this year-month, or the latest entry before it.
      let selected: PIKScheduleEntry | null = null;
      for (const entry of schedule) {
        if (entry.date <= targetKey) selected = entry;
        else break;
      }
      if (selected) {
        exposure += selected.closingExposure;
        pikToDate += selected.closingPIK;
      }
    }

    points.push({
      month: MONTH_LABELS[target.getMonth()],
      value: Math.round(exposure),
      returns: Math.round(pikToDate),
    });
  }
  return points;
}

export interface AllocationSlice {
  name: string;
  value: number;
  color: string;
}

const ALLOCATION_COLORS = ["#19212E", "#475569", "#94a3b8", "#cbd5e1", "#e2e8f0"];

// Derive allocation from disbursed capital by asset type. Empty input → empty list.
export function buildAllocationData(deals: Deal[]): AllocationSlice[] {
  const active = deals.filter(d => d.stage === "active" || d.stage === "documentation");
  const total = active.reduce((s, d) => s + d.disbursedAmount, 0);
  if (total === 0) return [];

  const byType = new Map<string, number>();
  for (const d of active) {
    byType.set(d.assetType, (byType.get(d.assetType) ?? 0) + d.disbursedAmount);
  }

  return [...byType.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount], i) => ({
      name,
      value: Math.round((amount / total) * 100),
      color: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length],
    }));
}

export interface UpcomingPayment {
  project: string;
  type: "Drawdown" | "Interest" | "Principal" | "PIK Accrual";
  date: string;
  amount: number;
  status: "scheduled" | "pending";
}

// Upcoming cash-flow events: next drawdowns across the portfolio, ordered by date.
// Drawdowns with status "disbursed" are already in the past and are excluded.
export function buildUpcomingPayments(deals: Deal[], limit = 5, today: Date = new Date()): UpcomingPayment[] {
  const events: UpcomingPayment[] = [];
  for (const d of deals) {
    for (const dd of d.drawdowns ?? []) {
      if (dd.status === "disbursed") continue;
      const scheduled = new Date(dd.scheduledDate);
      if (Number.isNaN(scheduled.getTime()) || scheduled < today) continue;
      events.push({
        project: d.projectName,
        type: "Drawdown",
        date: dd.scheduledDate,
        amount: dd.amount,
        status: dd.status === "approved" ? "scheduled" : "pending",
      });
    }
  }
  events.sort((a, b) => a.date.localeCompare(b.date));
  return events.slice(0, limit);
}

export interface PortfolioSummary {
  capitalCommitted: number;
  capitalDeployed: number;
  unrealizedGains: number;
  realizedGains: number;
  distributions: number;
}

// Derive summary tiles from actual deal data — no magic multipliers.
export function buildPortfolioSummary(deals: Deal[]): PortfolioSummary {
  const counted = deals.filter(d => d.stage === "active" || d.stage === "documentation" || d.stage === "repaid");
  const active = deals.filter(d => d.stage === "active");
  const repaid = deals.filter(d => d.stage === "repaid");

  return {
    capitalCommitted: counted.reduce((s, d) => s + d.loanAmount, 0),
    capitalDeployed: active.reduce((s, d) => s + d.disbursedAmount, 0),
    unrealizedGains: active.reduce((s, d) => s + d.accruedPIK, 0),
    realizedGains: repaid.reduce((s, d) => s + d.accruedPIK, 0),
    distributions: repaid.reduce((s, d) => s + d.disbursedAmount + d.accruedPIK, 0),
  };
}

// Returns accrued PIK across all active deals in the trailing `months` months.
export function quarterAccrual(deals: Deal[], months = 3, today: Date = new Date()): number {
  const active = deals.filter(d => d.stage === "active");
  let sum = 0;
  for (const d of active) {
    const schedule = scheduleForDeal(d);
    if (schedule.length === 0) continue;
    // Find the entry that corresponds to "today" and take the preceding `months` entries.
    const todayKey = today.toISOString().slice(0, 7);
    let idx = -1;
    for (let i = 0; i < schedule.length; i++) {
      if (schedule[i].date <= todayKey) idx = i;
      else break;
    }
    if (idx < 0) continue;
    const start = Math.max(0, idx - months + 1);
    for (let i = start; i <= idx; i++) {
      sum += schedule[i].pikAccrual + schedule[i].cashInterest;
    }
  }
  return sum;
}

// PIK Interest Accrual Engine
// Calculates monthly interest accrual, capitalization, and exposure projection

export type DayCount = "30/360" | "ACT/360" | "ACT/365";
export type CashInterestMode = "capitalized" | "paid";

export interface PIKScheduleEntry {
  month: number;
  date: string;
  openingPrincipal: number;
  openingPIK: number;
  totalExposure: number;
  drawdown: number;
  repayment: number;
  cashInterest: number;
  cashInterestPaid: number;
  pikAccrual: number;
  closingPrincipal: number;
  closingPIK: number;
  closingExposure: number;
}

export interface PIKSummary {
  dealId: string;
  totalCashInterestToDate: number;
  totalCashInterestPaidToDate: number;
  totalPIKAccruedToDate: number;
  totalFeesEarned: number;
  projectedPIKAtMaturity: number;
  projectedTotalExposureAtMaturity: number;
  currentMonthIndex: number;
  schedule: PIKScheduleEntry[];
}

// Days in a given calendar month (0-indexed JS month)
function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Period fraction for annual rate → period rate, based on day-count convention.
// For 30/360 the month is always 1/12. For ACT/* we use actual days in that month.
function periodFraction(dayCount: DayCount, monthDate: Date): number {
  if (dayCount === "30/360") return 1 / 12;
  const actual = daysInMonth(monthDate.getFullYear(), monthDate.getMonth());
  const basis = dayCount === "ACT/365" ? 365 : 360;
  return actual / basis;
}

/**
 * Generate a full PIK schedule for a deal from first drawdown to maturity.
 * Interest is calculated on (outstanding principal + accrued PIK) each month.
 *
 * Options:
 *   dayCount           – '30/360' (default), 'ACT/360', or 'ACT/365'
 *   cashInterestMode   – 'capitalized' (default, full-PIK) or 'paid' (cash rate is paid out, only PIK spread capitalises)
 *
 * Principal only accrues on drawdowns with status === "disbursed". Scheduled/approved
 * drawdowns that have not actually been wired do not accrue interest.
 */
export function generatePIKSchedule(params: {
  dealId: string;
  loanAmount: number;
  cashRate: number; // annual %
  pikSpread: number; // annual %
  tenor: number; // months
  firstDrawdownDate: string;
  drawdowns: { scheduledDate: string; amount: number; status: string }[];
  repayments?: { date: string; amount: number }[];
  dayCount?: DayCount;
  cashInterestMode?: CashInterestMode;
}): PIKSummary {
  const {
    dealId,
    loanAmount: _loanAmount,
    cashRate,
    pikSpread,
    tenor,
    firstDrawdownDate,
    drawdowns,
    repayments = [],
    dayCount = "30/360",
    cashInterestMode = "capitalized",
  } = params;
  void _loanAmount; // retained in signature for call-site compatibility

  const startDate = new Date(firstDrawdownDate);
  const annualPIKRate = pikSpread / 100;
  const annualCashRate = cashRate / 100;
  const schedule: PIKScheduleEntry[] = [];

  let runningPrincipal = 0;
  let runningPIK = 0;
  let currentMonthIndex = 0;
  const today = new Date();

  for (let m = 0; m < tenor; m++) {
    const monthDate = new Date(startDate);
    monthDate.setMonth(monthDate.getMonth() + m);
    const dateStr = monthDate.toISOString().slice(0, 7);

    const openingPrincipal = runningPrincipal;
    const openingPIK = runningPIK;
    const totalExposure = openingPrincipal + openingPIK;

    // Only "disbursed" drawdowns increase principal. Pending/approved are commitments
    // that have not hit the balance sheet yet, so they cannot accrue interest.
    const monthDrawdown = drawdowns
      .filter(dd => {
        const ddDate = new Date(dd.scheduledDate);
        return ddDate.getFullYear() === monthDate.getFullYear() &&
               ddDate.getMonth() === monthDate.getMonth() &&
               dd.status === "disbursed";
      })
      .reduce((sum, dd) => sum + dd.amount, 0);

    const monthRepayment = repayments
      .filter(rp => {
        const rpDate = new Date(rp.date);
        return rpDate.getFullYear() === monthDate.getFullYear() &&
               rpDate.getMonth() === monthDate.getMonth();
      })
      .reduce((sum, rp) => sum + rp.amount, 0);

    runningPrincipal += monthDrawdown - monthRepayment;
    if (runningPrincipal < 0) runningPrincipal = 0;

    const frac = periodFraction(dayCount, monthDate);
    const base = runningPrincipal + runningPIK;
    const cashInterest = base * annualCashRate * frac;
    const pikAccrual = base * annualPIKRate * frac;

    let cashInterestPaid = 0;
    if (cashInterestMode === "capitalized") {
      runningPIK += cashInterest + pikAccrual;
    } else {
      // Cash interest is paid out of the facility (not compounded). PIK spread still capitalises.
      runningPIK += pikAccrual;
      cashInterestPaid = cashInterest;
    }

    if (monthDate <= today) {
      currentMonthIndex = m;
    }

    schedule.push({
      month: m + 1,
      date: dateStr,
      openingPrincipal,
      openingPIK,
      totalExposure,
      drawdown: monthDrawdown,
      repayment: monthRepayment,
      cashInterest,
      cashInterestPaid,
      pikAccrual,
      closingPrincipal: runningPrincipal,
      closingPIK: runningPIK,
      closingExposure: runningPrincipal + runningPIK,
    });
  }

  const sliceToDate = schedule.slice(0, currentMonthIndex + 1);

  return {
    dealId,
    totalCashInterestToDate: sliceToDate.reduce((s, e) => s + e.cashInterest, 0),
    totalCashInterestPaidToDate: sliceToDate.reduce((s, e) => s + e.cashInterestPaid, 0),
    totalPIKAccruedToDate: sliceToDate.reduce((s, e) => s + e.pikAccrual, 0),
    totalFeesEarned: 0,
    projectedPIKAtMaturity: runningPIK,
    projectedTotalExposureAtMaturity: runningPrincipal + runningPIK,
    currentMonthIndex,
    schedule,
  };
}

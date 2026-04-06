// PIK Interest Accrual Engine
// Calculates monthly interest accrual, capitalization, and exposure projection

export interface PIKScheduleEntry {
  month: number;
  date: string;
  openingPrincipal: number;
  openingPIK: number;
  totalExposure: number;
  drawdown: number;
  repayment: number;
  cashInterest: number;
  pikAccrual: number;
  closingPrincipal: number;
  closingPIK: number;
  closingExposure: number;
}

export interface PIKSummary {
  dealId: string;
  totalCashInterestToDate: number;
  totalPIKAccruedToDate: number;
  totalFeesEarned: number;
  projectedPIKAtMaturity: number;
  projectedTotalExposureAtMaturity: number;
  currentMonthIndex: number;
  schedule: PIKScheduleEntry[];
}

/**
 * Generate a full PIK schedule for a deal from first drawdown to maturity.
 * Interest is calculated on (outstanding principal + accrued PIK) each month.
 * Cash interest is assumed deferred (PIK), i.e. capitalized monthly.
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
}): PIKSummary {
  const { dealId, loanAmount, cashRate, pikSpread, tenor, firstDrawdownDate, drawdowns, repayments = [] } = params;

  const startDate = new Date(firstDrawdownDate);
  const monthlyPIKRate = pikSpread / 100 / 12;
  const monthlyCashRate = cashRate / 100 / 12;
  const schedule: PIKScheduleEntry[] = [];

  let runningPrincipal = 0;
  let runningPIK = 0;
  let totalCashInterest = 0;
  let totalPIKAccrued = 0;
  let currentMonthIndex = 0;
  const today = new Date();

  for (let m = 0; m < tenor; m++) {
    const monthDate = new Date(startDate);
    monthDate.setMonth(monthDate.getMonth() + m);
    const dateStr = monthDate.toISOString().slice(0, 7);

    const openingPrincipal = runningPrincipal;
    const openingPIK = runningPIK;
    const totalExposure = openingPrincipal + openingPIK;

    // Find drawdowns in this month
    const monthDrawdown = drawdowns
      .filter(dd => {
        const ddDate = new Date(dd.scheduledDate);
        return ddDate.getFullYear() === monthDate.getFullYear() &&
               ddDate.getMonth() === monthDate.getMonth() &&
               (dd.status === "disbursed" || dd.status === "approved" || dd.status === "pending");
      })
      .reduce((sum, dd) => sum + dd.amount, 0);

    // Find repayments in this month
    const monthRepayment = repayments
      .filter(rp => {
        const rpDate = new Date(rp.date);
        return rpDate.getFullYear() === monthDate.getFullYear() &&
               rpDate.getMonth() === monthDate.getMonth();
      })
      .reduce((sum, rp) => sum + rp.amount, 0);

    runningPrincipal += monthDrawdown - monthRepayment;
    if (runningPrincipal < 0) runningPrincipal = 0;

    // Calculate interest on total exposure (principal + accrued PIK)
    const base = runningPrincipal + runningPIK;
    const cashInterest = base * monthlyCashRate;
    const pikAccrual = base * monthlyPIKRate;

    // PIK: capitalize both cash interest and PIK spread (full PIK structure)
    runningPIK += cashInterest + pikAccrual;
    totalCashInterest += cashInterest;
    totalPIKAccrued += pikAccrual;

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
      pikAccrual,
      closingPrincipal: runningPrincipal,
      closingPIK: runningPIK,
      closingExposure: runningPrincipal + runningPIK,
    });
  }

  return {
    dealId,
    totalCashInterestToDate: schedule.slice(0, currentMonthIndex + 1).reduce((s, e) => s + e.cashInterest, 0),
    totalPIKAccruedToDate: schedule.slice(0, currentMonthIndex + 1).reduce((s, e) => s + e.pikAccrual, 0),
    totalFeesEarned: 0,
    projectedPIKAtMaturity: runningPIK,
    projectedTotalExposureAtMaturity: runningPrincipal + runningPIK,
    currentMonthIndex,
    schedule,
  };
}

// Waterfall & Release Price Module
// Mandatory prepayment from unit sales, release prices, cash sweep, repayment projection

export interface ReleasePriceSchedule {
  unit: string;
  type: string;
  listPrice: number;
  releasePrice: number;
  releasePricePercent: number; // release price as % of list price
  salePrice?: number;
  status: "unreleased" | "sale_pending" | "released" | "paid";
  saleDate?: string;
  releaseDate?: string;
  mandatoryPrepayment?: number;
  excessToPromoter?: number;
}

export interface WaterfallEntry {
  date: string;
  type: "sale_proceeds" | "cash_sweep" | "scheduled_repayment" | "balloon" | "fee_payment";
  description: string;
  grossAmount: number;
  mandatoryPrepayment: number;
  interestPayment: number;
  feePayment: number;
  netToPromoter: number;
  remainingPrincipal: number;
  remainingPIK: number;
}

export interface WaterfallSummary {
  dealId: string;
  mandatoryPrepaymentRate: number; // % of sale price applied to prepayment
  cashSweepRate: number; // % excess cash swept
  totalProjectedSales: number;
  totalMandatoryPrepayment: number;
  totalInterestFromSales: number;
  totalToPromoter: number;
  projectedBalloonAtMaturity: number;
  releasePrices: ReleasePriceSchedule[];
  waterfall: WaterfallEntry[];
}

// Sample waterfall for deal-001
export const sampleWaterfalls: Record<string, WaterfallSummary> = {
  "deal-001": {
    dealId: "deal-001",
    mandatoryPrepaymentRate: 100, // 100% of release price goes to prepayment
    cashSweepRate: 50, // 50% of excess above release price swept
    totalProjectedSales: 31200000,
    totalMandatoryPrepayment: 6820000,
    totalInterestFromSales: 0,
    totalToPromoter: 24380000,
    projectedBalloonAtMaturity: 3200000,
    releasePrices: [
      { unit: "A-01", type: "2-bed apartment", listPrice: 510000, releasePrice: 204000, releasePricePercent: 40, salePrice: 502000, status: "released", saleDate: "2026-02-15", releaseDate: "2026-02-28", mandatoryPrepayment: 204000, excessToPromoter: 149000 },
      { unit: "A-02", type: "2-bed apartment", listPrice: 525000, releasePrice: 210000, releasePricePercent: 40, salePrice: 520000, status: "released", saleDate: "2026-03-10", releaseDate: "2026-03-25", mandatoryPrepayment: 210000, excessToPromoter: 155000 },
      { unit: "B-01", type: "3-bed apartment", listPrice: 740000, releasePrice: 296000, releasePricePercent: 40, salePrice: 735000, status: "sale_pending", saleDate: "2026-04-01", mandatoryPrepayment: 296000, excessToPromoter: 219500 },
      { unit: "B-02", type: "3-bed penthouse", listPrice: 980000, releasePrice: 392000, releasePricePercent: 40, status: "unreleased" },
      { unit: "C-01", type: "2-bed apartment", listPrice: 490000, releasePrice: 196000, releasePricePercent: 40, status: "unreleased" },
      { unit: "C-02", type: "3-bed apartment", listPrice: 755000, releasePrice: 302000, releasePricePercent: 40, status: "unreleased" },
    ],
    waterfall: [
      {
        date: "2026-02-28", type: "sale_proceeds", description: "Unit A-01 sale — 2-bed apartment",
        grossAmount: 502000, mandatoryPrepayment: 204000, interestPayment: 0, feePayment: 0,
        netToPromoter: 149000, remainingPrincipal: 9736000, remainingPIK: 520000,
      },
      {
        date: "2026-03-25", type: "sale_proceeds", description: "Unit A-02 sale — 2-bed apartment",
        grossAmount: 520000, mandatoryPrepayment: 210000, interestPayment: 0, feePayment: 0,
        netToPromoter: 155000, remainingPrincipal: 9526000, remainingPIK: 555000,
      },
      {
        date: "2027-08-20", type: "balloon", description: "Balloon payment at maturity",
        grossAmount: 0, mandatoryPrepayment: 0, interestPayment: 0, feePayment: 106500,
        netToPromoter: 0, remainingPrincipal: 0, remainingPIK: 0,
      },
    ],
  },
};

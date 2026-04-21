import { describe, it, expect } from "vitest";
import {
  buildAllocationData,
  buildPortfolioHistory,
  buildPortfolioSummary,
  buildUpcomingPayments,
} from "@/lib/investorMetrics";
import type { Deal } from "@/data/sampleDeals";

function makeDeal(overrides: Partial<Deal>): Deal {
  return {
    id: "d1",
    projectName: "Demo",
    borrower: "B",
    sponsor: "S",
    location: "Madrid",
    city: "Madrid",
    coordinates: [0, 0],
    stage: "active",
    assetType: "Residential - Build to Sell",
    description: "",
    loanAmount: 10_000_000,
    currency: "EUR",
    interestRate: 4.5,
    pikSpread: 4.5,
    totalRate: 9,
    originationFee: 1,
    exitFee: 1,
    tenor: 24,
    maturityDate: "2027-12-31",
    disbursedAmount: 5_000_000,
    outstandingPrincipal: 5_000_000,
    accruedPIK: 120_000,
    totalExposure: 5_120_000,
    gdv: 30_000_000,
    currentAppraisal: 28_000_000,
    totalUnits: 40,
    totalArea: 4000,
    constructionBudget: 12_000_000,
    constructionSpent: 3_000_000,
    constructionProgress: 25,
    landCost: 3_000_000,
    ltv: 35,
    ltc: 66,
    preSalesPercent: 45,
    developerExperience: "15y",
    developerTrackRecord: 10,
    dateReceived: "2024-01-01",
    expectedMaturity: "2027-12-31",
    firstDrawdownDate: "2025-01-15",
    drawdowns: [
      { id: "dd1", milestone: "m1", amount: 5_000_000, scheduledDate: "2025-01-15", status: "disbursed", constructionProgress: 0 },
      { id: "dd2", milestone: "m2", amount: 5_000_000, scheduledDate: "2026-08-15", status: "pending", constructionProgress: 50 },
    ],
    covenants: [],
    unitSales: [],
    tags: [],
    ...overrides,
  };
}

describe("buildPortfolioSummary", () => {
  it("sums commitments across active + documentation + repaid only", () => {
    const deals = [
      makeDeal({ id: "a", stage: "active", loanAmount: 10, disbursedAmount: 8, accruedPIK: 1 }),
      makeDeal({ id: "b", stage: "documentation", loanAmount: 5, disbursedAmount: 0, accruedPIK: 0 }),
      makeDeal({ id: "c", stage: "repaid", loanAmount: 7, disbursedAmount: 7, accruedPIK: 2 }),
      makeDeal({ id: "d", stage: "screening", loanAmount: 999, disbursedAmount: 0, accruedPIK: 0 }),
    ];
    const s = buildPortfolioSummary(deals);
    expect(s.capitalCommitted).toBe(22); // 10 + 5 + 7 — screening excluded
    expect(s.capitalDeployed).toBe(8);   // only active
    expect(s.unrealizedGains).toBe(1);
    expect(s.realizedGains).toBe(2);
    expect(s.distributions).toBe(9);     // 7 principal + 2 PIK returned
  });
});

describe("buildAllocationData", () => {
  it("groups deals by asset type and returns percentages", () => {
    const deals = [
      makeDeal({ id: "a", assetType: "Residential - Build to Sell", disbursedAmount: 6_000_000 }),
      makeDeal({ id: "b", assetType: "Residential - Build to Sell", disbursedAmount: 2_000_000 }),
      makeDeal({ id: "c", assetType: "Mixed Use", disbursedAmount: 2_000_000 }),
    ];
    const slices = buildAllocationData(deals);
    expect(slices).toHaveLength(2);
    expect(slices[0].name).toBe("Residential - Build to Sell");
    expect(slices[0].value).toBe(80);
    expect(slices[1].name).toBe("Mixed Use");
    expect(slices[1].value).toBe(20);
  });

  it("returns empty list when nothing is deployed", () => {
    expect(buildAllocationData([])).toEqual([]);
  });
});

describe("buildUpcomingPayments", () => {
  it("skips disbursed drawdowns and orders by date", () => {
    const today = new Date("2026-01-01");
    const deals = [
      makeDeal({
        id: "a",
        projectName: "Alpha",
        drawdowns: [
          { id: "1", milestone: "Land", amount: 1_000, scheduledDate: "2024-10-01", status: "disbursed", constructionProgress: 0 },
          { id: "2", milestone: "Structure", amount: 2_000, scheduledDate: "2026-05-01", status: "pending", constructionProgress: 40 },
        ],
      }),
      makeDeal({
        id: "b",
        projectName: "Beta",
        drawdowns: [
          { id: "3", milestone: "Finish", amount: 3_000, scheduledDate: "2026-03-01", status: "approved", constructionProgress: 70 },
        ],
      }),
    ];
    const events = buildUpcomingPayments(deals, 5, today);
    expect(events).toHaveLength(2);
    expect(events[0].project).toBe("Beta");
    expect(events[0].status).toBe("scheduled");
    expect(events[1].project).toBe("Alpha");
    expect(events[1].status).toBe("pending");
  });
});

describe("buildPortfolioHistory", () => {
  it("produces exactly N monthly points", () => {
    const today = new Date("2026-06-15");
    const deals = [makeDeal({})];
    const history = buildPortfolioHistory(deals, 6, today);
    expect(history).toHaveLength(6);
  });

  it("returns zero exposure before any drawdown", () => {
    const today = new Date("2024-12-01");
    const deals = [makeDeal({ firstDrawdownDate: "2025-01-15" })];
    const history = buildPortfolioHistory(deals, 3, today);
    // All three months are before the first scheduled drawdown.
    expect(history.every(p => p.value === 0)).toBe(true);
  });

  it("accumulates exposure over time once drawdowns start", () => {
    const today = new Date("2025-06-15");
    const deals = [makeDeal({ firstDrawdownDate: "2025-01-15" })];
    const history = buildPortfolioHistory(deals, 6, today);
    // Monotonic non-decreasing (compounding PIK, no repayments).
    for (let i = 1; i < history.length; i++) {
      expect(history[i].value).toBeGreaterThanOrEqual(history[i - 1].value);
    }
    expect(history[history.length - 1].value).toBeGreaterThan(0);
  });
});

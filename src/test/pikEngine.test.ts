import { describe, it, expect } from "vitest";
import { generatePIKSchedule } from "@/data/pikEngine";

describe("PIK Engine", () => {
  const baseParams = {
    dealId: "test-001",
    loanAmount: 10_000_000,
    cashRate: 4.5,
    pikSpread: 4.5,
    tenor: 24,
    firstDrawdownDate: "2025-01-01",
    drawdowns: [
      { scheduledDate: "2025-01-15", amount: 5_000_000, status: "disbursed" },
      { scheduledDate: "2025-07-15", amount: 5_000_000, status: "disbursed" },
    ],
  };

  it("generates correct number of months", () => {
    const result = generatePIKSchedule(baseParams);
    expect(result.schedule).toHaveLength(24);
  });

  it("first drawdown appears in month 1", () => {
    const result = generatePIKSchedule(baseParams);
    expect(result.schedule[0].drawdown).toBe(5_000_000);
    expect(result.schedule[0].closingPrincipal).toBe(5_000_000);
  });

  it("second drawdown appears in month 7", () => {
    const result = generatePIKSchedule(baseParams);
    expect(result.schedule[6].drawdown).toBe(5_000_000);
    expect(result.schedule[6].closingPrincipal).toBe(10_000_000);
  });

  it("PIK accrues monthly on outstanding principal + PIK", () => {
    const result = generatePIKSchedule(baseParams);
    const month1 = result.schedule[0];
    // First month: 5M principal, monthly PIK rate = 4.5% / 12 = 0.375%
    const expectedPIK = 5_000_000 * (4.5 / 100 / 12);
    expect(month1.pikAccrual).toBeCloseTo(expectedPIK, 0);
  });

  it("cash interest also capitalizes (full PIK structure)", () => {
    const result = generatePIKSchedule(baseParams);
    const month1 = result.schedule[0];
    const expectedCash = 5_000_000 * (4.5 / 100 / 12);
    expect(month1.cashInterest).toBeCloseTo(expectedCash, 0);
    // Both are capitalized into PIK
    expect(month1.closingPIK).toBeCloseTo(expectedCash + month1.pikAccrual, 0);
  });

  it("exposure grows over time due to compounding", () => {
    const result = generatePIKSchedule(baseParams);
    const firstExposure = result.schedule[0].closingExposure;
    const lastExposure = result.schedule[23].closingExposure;
    expect(lastExposure).toBeGreaterThan(firstExposure);
  });

  it("projected exposure at maturity exceeds loan amount due to PIK", () => {
    const result = generatePIKSchedule(baseParams);
    expect(result.projectedTotalExposureAtMaturity).toBeGreaterThan(10_000_000);
  });

  it("handles zero drawdowns gracefully", () => {
    const result = generatePIKSchedule({
      ...baseParams,
      drawdowns: [],
    });
    expect(result.schedule).toHaveLength(24);
    expect(result.schedule[0].closingPrincipal).toBe(0);
    expect(result.projectedPIKAtMaturity).toBe(0);
  });

  it("handles repayments", () => {
    const result = generatePIKSchedule({
      ...baseParams,
      repayments: [{ date: "2025-12-15", amount: 2_000_000 }],
    });
    // After repayment in month 12, principal should be reduced
    expect(result.schedule[11].closingPrincipal).toBe(8_000_000);
  });

  it("principal never goes below zero on excessive repayment", () => {
    const result = generatePIKSchedule({
      ...baseParams,
      repayments: [{ date: "2025-02-15", amount: 100_000_000 }],
    });
    expect(result.schedule[1].closingPrincipal).toBe(0);
  });

  it("opening values match previous month closing values", () => {
    const result = generatePIKSchedule(baseParams);
    for (let i = 1; i < result.schedule.length; i++) {
      expect(result.schedule[i].openingPrincipal).toBe(result.schedule[i - 1].closingPrincipal);
      expect(result.schedule[i].openingPIK).toBe(result.schedule[i - 1].closingPIK);
    }
  });

  it("skips non-disbursed drawdowns from principal (pending/approved do not accrue)", () => {
    const result = generatePIKSchedule({
      ...baseParams,
      drawdowns: [
        { scheduledDate: "2025-01-15", amount: 5_000_000, status: "disbursed" },
        { scheduledDate: "2025-07-15", amount: 5_000_000, status: "pending" },
        { scheduledDate: "2025-09-15", amount: 2_000_000, status: "approved" },
      ],
    });
    // Only the first (disbursed) drawdown counts towards principal.
    expect(result.schedule[6].drawdown).toBe(0);
    expect(result.schedule[8].drawdown).toBe(0);
    expect(result.schedule[23].closingPrincipal).toBe(5_000_000);
  });

  it("ACT/360 accrues slightly more interest than 30/360 on a 31-day month", () => {
    const schedule30 = generatePIKSchedule({ ...baseParams, dayCount: "30/360" });
    const scheduleAct = generatePIKSchedule({ ...baseParams, dayCount: "ACT/360" });
    // January has 31 days so ACT/360 > 30/360 for month 1.
    expect(scheduleAct.schedule[0].pikAccrual).toBeGreaterThan(schedule30.schedule[0].pikAccrual);
  });

  it("ACT/365 produces smaller accrual than ACT/360 on the same month", () => {
    const act360 = generatePIKSchedule({ ...baseParams, dayCount: "ACT/360" });
    const act365 = generatePIKSchedule({ ...baseParams, dayCount: "ACT/365" });
    expect(act365.schedule[0].pikAccrual).toBeLessThan(act360.schedule[0].pikAccrual);
  });

  it("cashInterestMode='paid' does not capitalise cash interest", () => {
    const capitalized = generatePIKSchedule({ ...baseParams, cashInterestMode: "capitalized" });
    const paid = generatePIKSchedule({ ...baseParams, cashInterestMode: "paid" });
    // PIK side is same, but closing PIK under 'paid' is lower (no cash compounding).
    expect(paid.schedule[0].closingPIK).toBeLessThan(capitalized.schedule[0].closingPIK);
    expect(paid.schedule[0].cashInterestPaid).toBeGreaterThan(0);
    expect(capitalized.schedule[0].cashInterestPaid).toBe(0);
  });
});

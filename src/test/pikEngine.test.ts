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
});

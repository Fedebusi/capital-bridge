import { describe, it, expect } from "vitest";
import { sliceHistory, buildPositionsCsv } from "@/pages/InvestorPortalPage";
import type { Deal } from "@/data/sampleDeals";

const SAMPLE_HISTORY = [
  { month: "Jul", value: 100 },
  { month: "Aug", value: 200 },
  { month: "Sep", value: 300 },
  { month: "Oct", value: 400 },
  { month: "Nov", value: 500 },
  { month: "Dec", value: 600 },
  { month: "Jan", value: 700 },
  { month: "Feb", value: 800 },
  { month: "Mar", value: 900 },
];

describe("sliceHistory", () => {
  it("returns only the last point for 1M", () => {
    const out = sliceHistory(SAMPLE_HISTORY, "1M");
    expect(out).toHaveLength(1);
    expect(out[0].month).toBe("Mar");
  });

  it("returns the last 3 points for 3M", () => {
    const out = sliceHistory(SAMPLE_HISTORY, "3M");
    expect(out).toHaveLength(3);
    expect(out.map(p => p.month)).toEqual(["Jan", "Feb", "Mar"]);
  });

  it("returns the last 6 points for 6M", () => {
    const out = sliceHistory(SAMPLE_HISTORY, "6M");
    expect(out).toHaveLength(6);
    expect(out[0].month).toBe("Oct");
  });

  it("returns all available points for 1Y when data is shorter than 12 months", () => {
    const out = sliceHistory(SAMPLE_HISTORY, "1Y");
    expect(out).toHaveLength(SAMPLE_HISTORY.length);
  });

  it("returns all points for All", () => {
    const out = sliceHistory(SAMPLE_HISTORY, "All");
    expect(out).toBe(SAMPLE_HISTORY);
  });

  it("handles empty arrays gracefully", () => {
    expect(sliceHistory([], "3M")).toEqual([]);
  });
});

const FAKE_DEAL: Deal = {
  id: "d1",
  projectName: "Terrazas del Faro",
  borrower: "Costa Real Estate",
  sponsor: "Costa Holdings",
  location: "Malaga",
  city: "Malaga",
  coordinates: [0, 0],
  stage: "active",
  assetType: "Residential",
  description: "",
  loanAmount: 10_000_000,
  currency: "EUR",
  interestRate: 8,
  pikSpread: 4,
  totalRate: 12,
  originationFee: 1,
  exitFee: 1,
  tenor: 24,
  maturityDate: "2027-12-31",
  disbursedAmount: 8_000_000,
  outstandingPrincipal: 8_000_000,
  accruedPIK: 250_000,
  totalExposure: 8_250_000,
  gdv: 20_000_000,
  currentAppraisal: 18_000_000,
  totalUnits: 40,
  totalArea: 4000,
  constructionBudget: 12_000_000,
  constructionSpent: 6_000_000,
  constructionProgress: 50,
  landCost: 3_000_000,
  ltv: 55,
  ltc: 70,
  preSalesPercent: 45,
  // fields below may not exist on the type; spread via unknown fallback
} as unknown as Deal;

describe("buildPositionsCsv", () => {
  it("returns a header-only CSV when no deals", () => {
    const csv = buildPositionsCsv([]);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain("Project");
    expect(lines[0]).toContain("Total Rate (%)");
  });

  it("writes one row per deal", () => {
    const csv = buildPositionsCsv([FAKE_DEAL]);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain("Terrazas del Faro");
    expect(lines[1]).toContain("Costa Real Estate");
    expect(lines[1]).toContain("8000000.00");
  });

  it("escapes commas and quotes in string fields", () => {
    const deal: Deal = { ...FAKE_DEAL, projectName: 'Foo, "Bar"' };
    const csv = buildPositionsCsv([deal]);
    const row = csv.split("\n")[1];
    // Field becomes "Foo, ""Bar"""
    expect(row.startsWith('"Foo, ""Bar"""')).toBe(true);
  });
});

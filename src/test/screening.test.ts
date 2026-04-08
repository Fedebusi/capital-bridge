import { describe, it, expect } from "vitest";

// Screening logic — extracted from ScreeningPage.tsx for testability
interface ScreeningInput {
  loanAmount: number;
  gdv: number;
  constructionBudget: number;
  landCost: number;
  preSalesPercent: number;
  developerProjects: number;
  assetType: string;
  location: string;
}

interface ScreeningResult {
  ltv: number;
  ltc: number;
  criteria: { label: string; pass: boolean; value: string; threshold: string }[];
  score: number;
  pass: boolean;
}

function screenDeal(input: ScreeningInput): ScreeningResult {
  const ltv = input.gdv > 0 ? (input.loanAmount / input.gdv) * 100 : 0;
  const ltc =
    input.constructionBudget + input.landCost > 0
      ? (input.loanAmount / (input.constructionBudget + input.landCost)) * 100
      : 0;

  const criteria = [
    {
      label: "LTV at Origination",
      pass: ltv <= 65,
      value: `${ltv.toFixed(1)}%`,
      threshold: "≤ 65%",
    },
    {
      label: "LTC",
      pass: ltc <= 75,
      value: `${ltc.toFixed(1)}%`,
      threshold: "≤ 75%",
    },
    {
      label: "Minimum Pre-Sales",
      pass: input.preSalesPercent >= 30,
      value: `${input.preSalesPercent}%`,
      threshold: "≥ 30%",
    },
    {
      label: "Developer Track Record",
      pass: input.developerProjects >= 5,
      value: `${input.developerProjects} projects`,
      threshold: "≥ 5 projects",
    },
    {
      label: "Ticket Size",
      pass: input.loanAmount >= 5_000_000 && input.loanAmount <= 25_000_000,
      value: `€${(input.loanAmount / 1_000_000).toFixed(1)}M`,
      threshold: "€5M - €25M",
    },
    {
      label: "Asset Type",
      pass: input.assetType.toLowerCase().includes("residential"),
      value: input.assetType,
      threshold: "Residential",
    },
  ];

  const passCount = criteria.filter((c) => c.pass).length;
  const score = Math.round((passCount / criteria.length) * 100);
  const pass = score >= 70; // 70% threshold to pass screening

  return { ltv, ltc, criteria, score, pass };
}

describe("Deal Screening", () => {
  const goodDeal: ScreeningInput = {
    loanAmount: 14_200_000,
    gdv: 31_200_000,
    constructionBudget: 15_800_000,
    landCost: 4_100_000,
    preSalesPercent: 47,
    developerProjects: 9,
    assetType: "Residential - Build to Sell",
    location: "Marbella, Malaga",
  };

  it("passes a good deal", () => {
    const result = screenDeal(goodDeal);
    expect(result.pass).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(70);
  });

  it("calculates LTV correctly", () => {
    const result = screenDeal(goodDeal);
    expect(result.ltv).toBeCloseTo(45.5, 1);
  });

  it("calculates LTC correctly", () => {
    const result = screenDeal(goodDeal);
    // LTC = 14.2M / (15.8M + 4.1M) = 71.4%
    expect(result.ltc).toBeCloseTo(71.4, 1);
  });

  it("fails deal with high LTV", () => {
    const result = screenDeal({ ...goodDeal, gdv: 20_000_000 });
    // LTV = 14.2M / 20M = 71% > 65%
    const ltvCriteria = result.criteria.find((c) => c.label === "LTV at Origination");
    expect(ltvCriteria?.pass).toBe(false);
  });

  it("fails deal with low pre-sales", () => {
    const result = screenDeal({ ...goodDeal, preSalesPercent: 15 });
    const preSalesCriteria = result.criteria.find((c) => c.label === "Minimum Pre-Sales");
    expect(preSalesCriteria?.pass).toBe(false);
  });

  it("fails deal with inexperienced developer", () => {
    const result = screenDeal({ ...goodDeal, developerProjects: 2 });
    const devCriteria = result.criteria.find((c) => c.label === "Developer Track Record");
    expect(devCriteria?.pass).toBe(false);
  });

  it("fails deal outside ticket range", () => {
    const result = screenDeal({ ...goodDeal, loanAmount: 3_000_000 });
    const ticketCriteria = result.criteria.find((c) => c.label === "Ticket Size");
    expect(ticketCriteria?.pass).toBe(false);
  });

  it("rejects non-residential asset", () => {
    const result = screenDeal({ ...goodDeal, assetType: "Commercial - Office" });
    const assetCriteria = result.criteria.find((c) => c.label === "Asset Type");
    expect(assetCriteria?.pass).toBe(false);
  });

  it("handles zero GDV without crashing", () => {
    const result = screenDeal({ ...goodDeal, gdv: 0 });
    expect(result.ltv).toBe(0);
  });

  it("score is 100% when all criteria pass", () => {
    const perfectDeal: ScreeningInput = {
      loanAmount: 10_000_000,
      gdv: 30_000_000,        // LTV 33% < 65% ✓
      constructionBudget: 12_000_000,
      landCost: 3_000_000,    // LTC 66.7% < 75% ✓
      preSalesPercent: 40,     // ≥ 30% ✓
      developerProjects: 10,   // ≥ 5 ✓
      assetType: "Residential - Build to Sell",  // ✓
      location: "Madrid",
    };
    const result = screenDeal(perfectDeal);
    expect(result.score).toBe(100);
    expect(result.pass).toBe(true);
  });
});

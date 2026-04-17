import { describe, it, expect } from "vitest";
import { buildTermSheetFromDeal } from "@/lib/buildTermSheetFromDeal";
import type { Deal } from "@/data/sampleDeals";

const baseDeal: Deal = {
  id: "d1",
  projectName: "Test Project",
  borrower: "Acme Developer SL",
  sponsor: "Acme Holding",
  location: "Madrid",
  city: "Madrid",
  coordinates: [40, -3],
  stage: "due_diligence",
  assetType: "Residential - Build to Sell",
  description: "24 units",
  loanAmount: 10_000_000,
  currency: "EUR",
  interestRate: 4.5,
  pikSpread: 4.0,
  totalRate: 8.5,
  originationFee: 1.5,
  exitFee: 0.75,
  tenor: 24,
  maturityDate: "2028-01-01",
  disbursedAmount: 0,
  outstandingPrincipal: 0,
  accruedPIK: 0,
  totalExposure: 0,
  gdv: 25_000_000,
  currentAppraisal: 15_000_000,
  totalUnits: 24,
  totalArea: 2800,
  constructionBudget: 12_000_000,
  constructionSpent: 0,
  constructionProgress: 0,
  landCost: 3_000_000,
  ltv: 40,
  ltc: 66,
  preSalesPercent: 30,
  developerExperience: "Experienced",
  developerTrackRecord: 8,
  dateReceived: "2026-01-10",
  termSheetDate: "2026-02-01",
  expectedMaturity: "2028-01-01",
  drawdowns: [],
  covenants: [],
  unitSales: [],
  tags: [],
};

describe("buildTermSheetFromDeal", () => {
  it("maps deal economics 1:1 to key terms", () => {
    const ts = buildTermSheetFromDeal(baseDeal);
    expect(ts.keyTerms.facility).toBe(10_000_000);
    expect(ts.keyTerms.cashRate).toBe(4.5);
    expect(ts.keyTerms.pikSpread).toBe(4.0);
    expect(ts.keyTerms.originationFee).toBe(1.5);
    expect(ts.keyTerms.exitFee).toBe(0.75);
    expect(ts.keyTerms.tenor).toBe(24);
  });

  it("marks signed when the deal has a term sheet date", () => {
    const ts = buildTermSheetFromDeal(baseDeal);
    expect(ts.currentStatus).toBe("signed");
    expect(ts.issuedDate).toBe("2026-02-01");
  });

  it("marks draft when there's no term sheet date yet", () => {
    const ts = buildTermSheetFromDeal({ ...baseDeal, termSheetDate: undefined });
    expect(ts.currentStatus).toBe("draft");
    expect(ts.issuedDate).toBeUndefined();
  });

  it("always produces a non-empty security package", () => {
    const ts = buildTermSheetFromDeal(baseDeal);
    expect(ts.keyTerms.securityPackage.length).toBeGreaterThan(0);
  });

  it("leaves versions[0] with the deal's received date if no term sheet date", () => {
    const ts = buildTermSheetFromDeal({ ...baseDeal, termSheetDate: undefined });
    expect(ts.versions[0].date).toBe(baseDeal.dateReceived);
  });

  it("has no CP validation block (synthesized term sheets haven't been submitted)", () => {
    const ts = buildTermSheetFromDeal(baseDeal);
    expect(ts.castlelakeValidation).toBeUndefined();
  });
});

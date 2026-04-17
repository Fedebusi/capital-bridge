import type { Deal } from "@/data/sampleDeals";
import type { TermSheet } from "@/data/termSheetData";

/**
 * Synthesize a minimal TermSheet from a Deal when no term_sheets row exists.
 *
 * Used as a fallback so the "Download Term Sheet" action always works, even
 * in live mode before the term_sheets table is populated for a given deal.
 * The resulting PDF uses the deal's own economic terms; version/audit history
 * are left empty.
 */
export function buildTermSheetFromDeal(deal: Deal): TermSheet {
  const hasTermSheet = deal.termSheetDate !== undefined;

  return {
    dealId: deal.id,
    currentStatus: hasTermSheet ? "signed" : "draft",
    currentVersion: 1,
    issuedDate: deal.termSheetDate,
    signedDate: deal.icApprovalDate,
    exclusivityEnd: undefined,
    castlelakeValidation: undefined,
    keyTerms: {
      facility: deal.loanAmount,
      cashRate: deal.interestRate,
      pikSpread: deal.pikSpread,
      originationFee: deal.originationFee,
      exitFee: deal.exitFee,
      tenor: deal.tenor,
      ltv: 65,
      ltc: 75,
      minPresales: 30,
      securityPackage: [
        "First-ranking mortgage on project land",
        "Share pledge (SPV)",
        "Account pledge",
        "Personal guarantee (UBO)",
        "Assignment of insurance proceeds",
        "Direct agreement with main contractor",
      ],
    },
    versions: [
      { version: 1, date: deal.termSheetDate ?? deal.dateReceived, status: "draft", updatedBy: deal.sponsor },
    ],
    auditTrail: [],
  };
}

// Term Sheet Workflow & Waiver Management
// Tracks term sheet issuance, Capital Partner validation, and covenant waiver requests

export type TermSheetStatus = "draft" | "internal_review" | "cp_validation" | "issued" | "negotiation" | "signed" | "expired" | "rejected";

export interface TermSheetVersion {
  version: number;
  date: string;
  status: TermSheetStatus;
  updatedBy: string;
  changes?: string;
}

export interface TermSheet {
  dealId: string;
  currentStatus: TermSheetStatus;
  currentVersion: number;
  issuedDate?: string;
  signedDate?: string;
  exclusivityEnd?: string;
  castlelakeValidation?: {
    submitted: boolean;
    submittedDate?: string;
    approved?: boolean;
    approvedBy?: string;
    approvedDate?: string;
    conditions?: string[];
    memoAttached: boolean;
    modelAttached: boolean;
  };
  keyTerms: {
    facility: number;
    cashRate: number;
    pikSpread: number;
    originationFee: number;
    exitFee: number;
    tenor: number;
    ltv: number;
    ltc: number;
    minPresales: number;
    securityPackage: string[];
  };
  versions: TermSheetVersion[];
  auditTrail: { action: string; user: string; date: string; detail?: string }[];
}

export interface EnhancedWaiver {
  id: string;
  dealId: string;
  covenantName: string;
  requestDate: string;
  reason: string;
  currentValue: string;
  threshold: string;
  proposedFee: number;
  feeType: "flat" | "bps_on_outstanding";
  status: "requested" | "internal_review" | "cp_review" | "approved" | "rejected" | "expired";
  validityPeriod?: string; // e.g. "3 months"
  internalApproval?: { approved: boolean; approvedBy: string; date: string };
  cpApproval?: { approved: boolean; approvedBy: string; date: string; conditions?: string[] };
  auditTrail: { action: string; user: string; date: string; detail?: string }[];
}

// Sample data
export const sampleTermSheets: Record<string, TermSheet> = {
  "deal-001": {
    dealId: "deal-001",
    currentStatus: "signed",
    currentVersion: 3,
    issuedDate: "2025-04-28",
    signedDate: "2025-05-15",
    exclusivityEnd: "2025-06-30",
    castlelakeValidation: {
      submitted: true, submittedDate: "2025-04-25",
      approved: true, approvedBy: "K. Walsh (Capital Partner)", approvedDate: "2025-04-28",
      conditions: ["Require minimum 40% pre-sales before 3rd drawdown"],
      memoAttached: true, modelAttached: true,
    },
    keyTerms: {
      facility: 14200000, cashRate: 4.5, pikSpread: 4.5,
      originationFee: 1.5, exitFee: 0.75, tenor: 24,
      ltv: 65, ltc: 75, minPresales: 30,
      securityPackage: ["First-ranking mortgage", "Share pledge (SPV)", "Share pledge (sponsor)", "Account pledge", "Personal guarantee UBO", "Direct agreement contractor"],
    },
    versions: [
      { version: 1, date: "2025-04-15", status: "draft", updatedBy: "M. Rivera" },
      { version: 2, date: "2025-04-22", status: "internal_review", updatedBy: "M. Rivera", changes: "Adjusted LTV covenant from 60% to 65%" },
      { version: 3, date: "2025-04-28", status: "signed", updatedBy: "M. Rivera", changes: "Final terms after Capital Partner validation" },
    ],
    auditTrail: [
      { action: "Term Sheet Drafted", user: "M. Rivera", date: "2025-04-15" },
      { action: "Internal Review Completed", user: "P. Serrano", date: "2025-04-22" },
      { action: "Submitted to Capital Partner", user: "M. Rivera", date: "2025-04-25", detail: "Memo and preliminary model attached" },
      { action: "Capital Partner Approved", user: "K. Walsh", date: "2025-04-28", detail: "Approved with condition on pre-sales" },
      { action: "Term Sheet Issued to Borrower", user: "M. Rivera", date: "2025-04-28" },
      { action: "Exclusivity Agreement Signed", user: "Borrower", date: "2025-05-02" },
      { action: "Term Sheet Signed", user: "Solaris Promociones SL", date: "2025-05-15" },
    ],
  },
  "deal-002": {
    dealId: "deal-002",
    currentStatus: "cp_validation",
    currentVersion: 2,
    issuedDate: undefined,
    exclusivityEnd: undefined,
    castlelakeValidation: {
      submitted: true, submittedDate: "2026-03-20",
      approved: undefined, approvedBy: undefined, approvedDate: undefined,
      conditions: undefined,
      memoAttached: true, modelAttached: false,
    },
    keyTerms: {
      facility: 19500000, cashRate: 4.25, pikSpread: 4.25,
      originationFee: 1.25, exitFee: 0.5, tenor: 30,
      ltv: 65, ltc: 75, minPresales: 30,
      securityPackage: ["First-ranking mortgage", "Share pledge (SPV)", "Account pledge", "Corporate guarantee"],
    },
    versions: [
      { version: 1, date: "2026-03-10", status: "draft", updatedBy: "A. Delgado" },
      { version: 2, date: "2026-03-18", status: "cp_validation", updatedBy: "A. Delgado", changes: "Adjusted tenor from 28 to 30 months" },
    ],
    auditTrail: [
      { action: "Term Sheet Drafted", user: "A. Delgado", date: "2026-03-10" },
      { action: "Internal Review Completed", user: "L. Campos", date: "2026-03-18" },
      { action: "Submitted to Capital Partner", user: "R. Medina", date: "2026-03-20", detail: "Memo attached, model pending" },
    ],
  },
  "deal-003": {
    dealId: "deal-003",
    currentStatus: "signed",
    currentVersion: 2,
    issuedDate: "2026-03-08",
    signedDate: "2026-03-15",
    exclusivityEnd: "2026-04-30",
    castlelakeValidation: {
      submitted: true, submittedDate: "2026-03-05",
      approved: true, approvedBy: "K. Walsh (Capital Partner)", approvedDate: "2026-03-07",
      conditions: [],
      memoAttached: true, modelAttached: true,
    },
    keyTerms: {
      facility: 6800000, cashRate: 5.0, pikSpread: 4.0,
      originationFee: 1.5, exitFee: 1.0, tenor: 22,
      ltv: 65, ltc: 75, minPresales: 25,
      securityPackage: ["First-ranking mortgage", "Share pledge (SPV)", "Account pledge", "Personal guarantee"],
    },
    versions: [
      { version: 1, date: "2026-03-01", status: "draft", updatedBy: "M. Rivera" },
      { version: 2, date: "2026-03-08", status: "signed", updatedBy: "M. Rivera" },
    ],
    auditTrail: [
      { action: "Term Sheet Drafted", user: "M. Rivera", date: "2026-03-01" },
      { action: "Submitted to Capital Partner", user: "M. Rivera", date: "2026-03-05" },
      { action: "Capital Partner Approved", user: "K. Walsh", date: "2026-03-07" },
      { action: "Term Sheet Issued & Signed", user: "Borrower", date: "2026-03-15" },
    ],
  },
};

export const sampleEnhancedWaivers: Record<string, EnhancedWaiver[]> = {
  "deal-002": [
    {
      id: "ew-001", dealId: "deal-002", covenantName: "Maximum LTV",
      requestDate: "2026-03-28",
      reason: "LTV at 72.8% due to conservative initial appraisal. Developer expects updated valuation post-permit to bring LTV within limits.",
      currentValue: "72.8%", threshold: "≤ 65%",
      proposedFee: 25000, feeType: "flat",
      status: "cp_review",
      validityPeriod: "6 months",
      internalApproval: { approved: true, approvedBy: "P. Serrano", date: "2026-03-30" },
      cpApproval: undefined,
      auditTrail: [
        { action: "Waiver Requested", user: "A. Delgado", date: "2026-03-28", detail: "Borrower requested temporary LTV waiver pending updated appraisal" },
        { action: "Internal Review", user: "P. Serrano", date: "2026-03-30", detail: "Approved internally — fee of €25,000 proposed" },
        { action: "Submitted to Capital Partner", user: "R. Medina", date: "2026-04-01", detail: "Awaiting Capital Partner approval" },
      ],
    },
  ],
};

export const termSheetStatusLabels: Record<TermSheetStatus, string> = {
  draft: "Draft",
  internal_review: "Internal Review",
  cp_validation: "Capital Partner Validation",
  issued: "Issued",
  negotiation: "Negotiation",
  signed: "Signed",
  expired: "Expired",
  rejected: "Rejected",
};

export const termSheetStatusColors: Record<TermSheetStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  internal_review: "bg-blue-100 text-blue-700",
  cp_validation: "bg-amber-100 text-amber-700",
  issued: "bg-cyan-100 text-cyan-700",
  negotiation: "bg-purple-100 text-purple-700",
  signed: "bg-emerald-100 text-emerald-700",
  expired: "bg-gray-100 text-gray-500",
  rejected: "bg-red-100 text-red-600",
};

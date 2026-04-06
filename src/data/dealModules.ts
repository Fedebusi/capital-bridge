import { type Deal } from "./sampleDeals";

// ===== DUE DILIGENCE =====
export type DDCategory = "technical" | "commercial" | "legal" | "financial" | "environmental" | "appraisal";

export interface DDItem {
  id: string;
  category: DDCategory;
  label: string;
  status: "pending" | "in_progress" | "completed" | "flagged" | "not_applicable";
  assignee?: string;
  dueDate?: string;
  completedDate?: string;
  notes?: string;
  documents?: { name: string; version: number; uploadDate: string }[];
}

export const ddCategoryLabels: Record<DDCategory, string> = {
  technical: "Technical / Urban Planning",
  commercial: "Commercial / Market",
  legal: "Legal Review",
  financial: "Financial Analysis",
  environmental: "Environmental / KYC / AML",
  appraisal: "Independent Appraisal",
};

// ===== APPROVAL WORKFLOW =====
export type VoteDecision = "approve" | "reject" | "approve_with_conditions";

export interface ICVote {
  id: string;
  voter: string;
  role: string;
  decision: VoteDecision;
  conditions?: string;
  date: string;
}

export interface ApprovalRecord {
  dealId: string;
  icDate: string;
  status: "pending_ic" | "pending_capital_partner" | "approved" | "rejected" | "approved_with_conditions";
  votes: ICVote[];
  capitalPartnerSignOff?: { approved: boolean; signedBy: string; date: string; conditions?: string };
  auditTrail: { action: string; user: string; date: string; detail?: string }[];
}

// ===== LEGAL DOCUMENTS =====
export type LegalDocStatus = "not_started" | "drafting" | "review" | "negotiation" | "agreed" | "executed";

export interface LegalDocument {
  id: string;
  name: string;
  type: string;
  status: LegalDocStatus;
  currentVersion: number;
  assignedTo: string;
  deadline?: string;
  lastUpdated: string;
  notes?: string;
}

// ===== CONDITIONS PRECEDENT =====
export interface ConditionPrecedent {
  id: string;
  category: string;
  description: string;
  status: "pending" | "submitted" | "verified" | "waived";
  verifiedBy?: string;
  verifiedDate?: string;
  notes?: string;
}

// ===== SECURITY PACKAGE =====
export interface SecurityItem {
  id: string;
  type: string;
  description: string;
  status: "pending" | "in_progress" | "executed" | "released";
  entity?: string;
  registrationDate?: string;
  expiryDate?: string;
  notes?: string;
}

// ===== COVENANT WAIVER =====
export interface CovenantWaiver {
  id: string;
  covenantName: string;
  requestDate: string;
  reason: string;
  proposedFee: number;
  status: "requested" | "cp_review" | "approved" | "rejected";
  cpApproval?: { approved: boolean; approvedBy: string; date: string };
}

// ===== SAMPLE DATA =====

export const sampleDueDiligence: Record<string, DDItem[]> = {
  "deal-001": [
    { id: "dd-t1", category: "technical", label: "Building license verification", status: "completed", assignee: "Ana Reyes", completedDate: "2025-04-20", documents: [{ name: "Licencia_obra.pdf", version: 2, uploadDate: "2025-04-20" }] },
    { id: "dd-t2", category: "technical", label: "Urban planning compliance check", status: "completed", assignee: "Ana Reyes", completedDate: "2025-04-22" },
    { id: "dd-t3", category: "technical", label: "Soil survey & geotechnical report", status: "completed", assignee: "Ing. Carlos Vega", completedDate: "2025-05-01", documents: [{ name: "Geotecnico_informe.pdf", version: 1, uploadDate: "2025-05-01" }] },
    { id: "dd-c1", category: "commercial", label: "Market comparables analysis", status: "completed", assignee: "María López", completedDate: "2025-05-10", documents: [{ name: "Market_analysis_v3.pdf", version: 3, uploadDate: "2025-05-10" }] },
    { id: "dd-c2", category: "commercial", label: "Pre-sales verification", status: "completed", assignee: "María López", completedDate: "2025-05-15" },
    { id: "dd-c3", category: "commercial", label: "Competitor supply assessment", status: "completed", assignee: "María López", completedDate: "2025-05-12" },
    { id: "dd-l1", category: "legal", label: "Title search & encumbrances", status: "completed", assignee: "Bufete Garrigues", completedDate: "2025-04-25" },
    { id: "dd-l2", category: "legal", label: "Corporate structure review (SPV)", status: "completed", assignee: "Bufete Garrigues", completedDate: "2025-05-05" },
    { id: "dd-l3", category: "legal", label: "Litigation & claims check", status: "completed", assignee: "Bufete Garrigues", completedDate: "2025-05-08" },
    { id: "dd-f1", category: "financial", label: "Developer financial statements analysis", status: "completed", assignee: "Diego Martín", completedDate: "2025-05-02", documents: [{ name: "Financial_review.pdf", version: 2, uploadDate: "2025-05-02" }] },
    { id: "dd-f2", category: "financial", label: "Construction budget review", status: "completed", assignee: "Diego Martín", completedDate: "2025-05-06" },
    { id: "dd-f3", category: "financial", label: "Cash flow model stress test", status: "completed", assignee: "Diego Martín", completedDate: "2025-05-08" },
    { id: "dd-e1", category: "environmental", label: "KYC / AML screening", status: "completed", assignee: "Compliance Team", completedDate: "2025-04-15" },
    { id: "dd-e2", category: "environmental", label: "Environmental impact assessment", status: "completed", assignee: "EcoConsult SL", completedDate: "2025-04-28" },
    { id: "dd-a1", category: "appraisal", label: "Independent valuation (current)", status: "completed", assignee: "CBRE Valuation", completedDate: "2025-05-12", documents: [{ name: "Valuation_CBRE.pdf", version: 1, uploadDate: "2025-05-12" }] },
    { id: "dd-a2", category: "appraisal", label: "GDV assessment", status: "completed", assignee: "CBRE Valuation", completedDate: "2025-05-12" },
  ],
  "deal-002": [
    { id: "dd-t1", category: "technical", label: "Building license verification", status: "in_progress", assignee: "Pablo Herrera", dueDate: "2026-04-15" },
    { id: "dd-t2", category: "technical", label: "Urban planning compliance check", status: "pending", assignee: "Pablo Herrera", dueDate: "2026-04-20" },
    { id: "dd-t3", category: "technical", label: "Soil survey & geotechnical report", status: "pending", dueDate: "2026-04-25" },
    { id: "dd-c1", category: "commercial", label: "Market comparables analysis", status: "in_progress", assignee: "Sofía Ruiz", dueDate: "2026-04-18" },
    { id: "dd-c2", category: "commercial", label: "Pre-sales verification", status: "pending", dueDate: "2026-04-22" },
    { id: "dd-l1", category: "legal", label: "Title search & encumbrances", status: "completed", assignee: "Uría Menéndez", completedDate: "2026-03-28" },
    { id: "dd-l2", category: "legal", label: "Corporate structure review (SPV)", status: "in_progress", assignee: "Uría Menéndez", dueDate: "2026-04-10" },
    { id: "dd-f1", category: "financial", label: "Developer financial statements analysis", status: "flagged", assignee: "Elena Torres", notes: "Missing FY2025 audited accounts — requested from borrower" },
    { id: "dd-f2", category: "financial", label: "Construction budget review", status: "pending", dueDate: "2026-04-20" },
    { id: "dd-e1", category: "environmental", label: "KYC / AML screening", status: "completed", assignee: "Compliance Team", completedDate: "2026-03-12" },
    { id: "dd-e2", category: "environmental", label: "Environmental impact assessment", status: "pending", dueDate: "2026-04-30" },
    { id: "dd-a1", category: "appraisal", label: "Independent valuation (current)", status: "pending", dueDate: "2026-05-05" },
  ],
};

export const sampleApprovals: Record<string, ApprovalRecord> = {
  "deal-001": {
    dealId: "deal-001",
    icDate: "2025-06-05",
    status: "approved",
    votes: [
      { id: "v1", voter: "Alejandro Durán", role: "CIO", decision: "approve", date: "2025-06-05" },
      { id: "v2", voter: "Isabel Navarro", role: "Head of Credit", decision: "approve", date: "2025-06-05" },
      { id: "v3", voter: "Marcos Peña", role: "Head of Legal", decision: "approve_with_conditions", conditions: "Require minimum 40% pre-sales before 3rd drawdown", date: "2025-06-05" },
    ],
    capitalPartnerSignOff: { approved: true, signedBy: "Jürgen Weber (Ares Management)", date: "2025-06-10" },
    auditTrail: [
      { action: "IC Meeting Scheduled", user: "System", date: "2025-05-28" },
      { action: "Credit Paper Distributed", user: "Isabel Navarro", date: "2025-05-30" },
      { action: "IC Meeting Held", user: "System", date: "2025-06-05" },
      { action: "IC Approved (3/3 votes)", user: "System", date: "2025-06-05" },
      { action: "Capital Partner Sign-Off", user: "Jürgen Weber", date: "2025-06-10", detail: "Approved without additional conditions" },
      { action: "Deal Moved to Documentation", user: "Alejandro Durán", date: "2025-06-11" },
    ],
  },
  "deal-003": {
    dealId: "deal-003",
    icDate: "2026-04-10",
    status: "pending_capital_partner",
    votes: [
      { id: "v1", voter: "Alejandro Durán", role: "CIO", decision: "approve", date: "2026-04-10" },
      { id: "v2", voter: "Isabel Navarro", role: "Head of Credit", decision: "approve", date: "2026-04-10" },
      { id: "v3", voter: "Marcos Peña", role: "Head of Legal", decision: "approve", date: "2026-04-10" },
    ],
    capitalPartnerSignOff: undefined,
    auditTrail: [
      { action: "IC Meeting Scheduled", user: "System", date: "2026-04-03" },
      { action: "Credit Paper Distributed", user: "Isabel Navarro", date: "2026-04-05" },
      { action: "IC Meeting Held", user: "System", date: "2026-04-10" },
      { action: "IC Approved Unanimously", user: "System", date: "2026-04-10" },
      { action: "Submitted to Capital Partner", user: "Alejandro Durán", date: "2026-04-11" },
    ],
  },
};

export const sampleLegalDocs: Record<string, LegalDocument[]> = {
  "deal-001": [
    { id: "ld-1", name: "Facility Agreement", type: "facility_agreement", status: "executed", currentVersion: 4, assignedTo: "Bufete Garrigues", lastUpdated: "2025-07-10" },
    { id: "ld-2", name: "First-Ranking Mortgage Deed", type: "mortgage", status: "executed", currentVersion: 2, assignedTo: "Notaría Rodríguez", lastUpdated: "2025-07-15" },
    { id: "ld-3", name: "Share Pledge Agreement", type: "pledge", status: "executed", currentVersion: 3, assignedTo: "Bufete Garrigues", lastUpdated: "2025-07-12" },
    { id: "ld-4", name: "Project Account Agreement", type: "escrow", status: "executed", currentVersion: 2, assignedTo: "CaixaBank", lastUpdated: "2025-07-08" },
    { id: "ld-5", name: "Direct Agreement with Constructor", type: "direct_agreement", status: "executed", currentVersion: 2, assignedTo: "Bufete Garrigues", lastUpdated: "2025-07-14" },
    { id: "ld-6", name: "Corporate Guarantees", type: "guarantee", status: "executed", currentVersion: 1, assignedTo: "Bufete Garrigues", lastUpdated: "2025-07-10" },
  ],
  "deal-006": [
    { id: "ld-1", name: "Facility Agreement", type: "facility_agreement", status: "negotiation", currentVersion: 3, assignedTo: "Cuatrecasas", deadline: "2026-05-15", lastUpdated: "2026-04-02" },
    { id: "ld-2", name: "First-Ranking Mortgage Deed", type: "mortgage", status: "drafting", currentVersion: 1, assignedTo: "Notaría Palma", deadline: "2026-05-20", lastUpdated: "2026-03-28" },
    { id: "ld-3", name: "Share Pledge Agreement", type: "pledge", status: "review", currentVersion: 2, assignedTo: "Cuatrecasas", deadline: "2026-05-15", lastUpdated: "2026-04-01" },
    { id: "ld-4", name: "Project Account Agreement", type: "escrow", status: "drafting", currentVersion: 1, assignedTo: "Banco Sabadell", deadline: "2026-05-25", lastUpdated: "2026-03-30" },
    { id: "ld-5", name: "Direct Agreement with Constructor", type: "direct_agreement", status: "not_started", currentVersion: 0, assignedTo: "Cuatrecasas", deadline: "2026-06-01", lastUpdated: "2026-03-25" },
    { id: "ld-6", name: "Intercreditor Agreement", type: "intercreditor", status: "not_started", currentVersion: 0, assignedTo: "Cuatrecasas", deadline: "2026-06-01", lastUpdated: "2026-03-25" },
  ],
};

export const sampleConditionsPrecedent: Record<string, ConditionPrecedent[]> = {
  "deal-001": [
    { id: "cp-1", category: "Administrative", description: "Valid building license", status: "verified", verifiedBy: "Ana Reyes", verifiedDate: "2025-06-20" },
    { id: "cp-2", category: "Insurance", description: "All-risk construction insurance policy", status: "verified", verifiedBy: "Marcos Peña", verifiedDate: "2025-06-25" },
    { id: "cp-3", category: "Financial", description: "Project account opened and operational", status: "verified", verifiedBy: "Diego Martín", verifiedDate: "2025-06-22" },
    { id: "cp-4", category: "Financial", description: "Developer equity contribution (min. 20%)", status: "verified", verifiedBy: "Diego Martín", verifiedDate: "2025-06-28" },
    { id: "cp-5", category: "Legal", description: "Signed construction contract with main contractor", status: "verified", verifiedBy: "Marcos Peña", verifiedDate: "2025-06-30" },
    { id: "cp-6", category: "Legal", description: "All security documents executed", status: "verified", verifiedBy: "Marcos Peña", verifiedDate: "2025-07-15" },
    { id: "cp-7", category: "Administrative", description: "Tax clearance certificates", status: "verified", verifiedBy: "Compliance Team", verifiedDate: "2025-06-18" },
  ],
  "deal-006": [
    { id: "cp-1", category: "Administrative", description: "Valid building license", status: "submitted", notes: "Under review by legal" },
    { id: "cp-2", category: "Insurance", description: "All-risk construction insurance policy", status: "pending" },
    { id: "cp-3", category: "Financial", description: "Project account opened and operational", status: "pending" },
    { id: "cp-4", category: "Financial", description: "Developer equity contribution (min. 20%)", status: "submitted", notes: "Evidence of €4.2M transfer submitted" },
    { id: "cp-5", category: "Legal", description: "Signed construction contract with main contractor", status: "pending" },
    { id: "cp-6", category: "Legal", description: "All security documents executed", status: "pending" },
    { id: "cp-7", category: "Administrative", description: "Tax clearance certificates", status: "verified", verifiedBy: "Compliance Team", verifiedDate: "2026-03-15" },
  ],
};

export const sampleSecurityPackages: Record<string, SecurityItem[]> = {
  "deal-001": [
    { id: "sp-1", type: "First-Ranking Mortgage", description: "Mortgage over land and building at Marbella plot 42-B", status: "executed", entity: "Luminara Promociones SL", registrationDate: "2025-07-15" },
    { id: "sp-2", type: "Share Pledge", description: "100% shares of Luminara Promociones SL (project SPV)", status: "executed", entity: "Grupo Montalbán Inversiones", registrationDate: "2025-07-12" },
    { id: "sp-3", type: "Share Pledge", description: "100% shares of Grupo Montalbán Holding SL (sponsor)", status: "executed", entity: "Montalbán Family Office", registrationDate: "2025-07-12" },
    { id: "sp-4", type: "Account Pledge", description: "Pledge over project account at CaixaBank", status: "executed", entity: "Luminara Promociones SL", registrationDate: "2025-07-08" },
    { id: "sp-5", type: "Insurance Assignment", description: "Lender as loss payee on all-risk construction insurance", status: "executed", entity: "AXA Seguros" },
    { id: "sp-6", type: "Direct Agreement", description: "Step-in rights with main contractor Construcciones Mediterráneo SA", status: "executed", entity: "Construcciones Mediterráneo SA", registrationDate: "2025-07-14" },
    { id: "sp-7", type: "Personal Guarantee", description: "Personal guarantee from D. Ricardo Montalbán (UBO)", status: "executed", entity: "Ricardo Montalbán" },
    { id: "sp-8", type: "Equity Contribution", description: "Undertaking to inject additional equity if LTV exceeds 60%", status: "executed", entity: "Grupo Montalbán Inversiones" },
  ],
  "deal-006": [
    { id: "sp-1", type: "First-Ranking Mortgage", description: "Mortgage over seafront plots in Portixol", status: "in_progress", entity: "Port Vell Residences SL" },
    { id: "sp-2", type: "Share Pledge", description: "100% shares of Port Vell Residences SL", status: "pending", entity: "Tramuntana Real Estate" },
    { id: "sp-3", type: "Account Pledge", description: "Pledge over project account", status: "pending", entity: "Port Vell Residences SL" },
    { id: "sp-4", type: "Insurance Assignment", description: "Lender as loss payee on construction insurance", status: "pending", entity: "TBD" },
    { id: "sp-5", type: "Direct Agreement", description: "Step-in rights with constructor", status: "pending", entity: "TBD" },
    { id: "sp-6", type: "Corporate Guarantee", description: "Guarantee from Tramuntana Real Estate SL", status: "in_progress", entity: "Tramuntana Real Estate" },
  ],
};

export const sampleWaivers: Record<string, CovenantWaiver[]> = {
  "deal-002": [
    { id: "cw-1", covenantName: "Maximum LTV", requestDate: "2026-03-28", reason: "LTV at 72.8% due to conservative initial appraisal. Developer expects updated valuation post-permit to bring LTV within limits.", proposedFee: 25000, status: "cp_review" },
  ],
};

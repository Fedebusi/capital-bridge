// Auto-generated types matching the Supabase schema
// These types map 1:1 to the database tables defined in supabase/migrations/

export type DealStage =
  | "screening"
  | "due_diligence"
  | "ic_approval"
  | "documentation"
  | "active"
  | "repaid"
  | "rejected";

export type CovenantStatus = "compliant" | "watch" | "breach";
export type DrawdownStatus = "pending" | "requested" | "approved" | "disbursed";
export type UnitSaleStatus = "available" | "reserved" | "contracted" | "sold";
export type DDStatus = "pending" | "in_progress" | "completed" | "flagged" | "not_applicable";
export type DDCategory = "technical" | "commercial" | "legal" | "financial" | "environmental" | "appraisal";
export type VoteDecision = "approve" | "reject" | "approve_with_conditions";
export type ApprovalStatus = "pending_ic" | "pending_capital_partner" | "approved" | "rejected" | "approved_with_conditions";
export type LegalDocStatus = "not_started" | "drafting" | "review" | "negotiation" | "agreed" | "executed";
export type ConditionPrecedentStatus = "pending" | "submitted" | "verified" | "waived";
export type SecurityItemStatus = "pending" | "in_progress" | "executed" | "released";
export type TermSheetStatus = "draft" | "internal_review" | "cp_validation" | "issued" | "negotiation" | "signed" | "expired" | "rejected";
export type WaiverStatus = "requested" | "internal_review" | "cp_review" | "approved" | "rejected" | "expired";
export type KYCStatus = "valid" | "expiring_soon" | "expired" | "pending";
export type BorrowerRating = "A" | "B" | "C" | "D" | "unrated";
export type UserRole = "admin" | "analyst" | "portfolio_manager" | "investor" | "viewer";
export type CertificationStatus = "submitted" | "reviewed" | "approved" | "paid" | "disputed";
export type SiteVisitRecommendation = "proceed" | "hold" | "review";
export type ScheduleStatus = "on_track" | "minor_delay" | "major_delay" | "ahead";
export type CostStatus = "within_budget" | "minor_overrun" | "major_overrun" | "under_budget";
export type QualityAssessment = "satisfactory" | "needs_improvement" | "unsatisfactory";

// ===== ROW TYPES (what comes from the DB) =====

export interface DbProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbDeal {
  id: string;
  project_name: string;
  borrower_id: string | null;
  borrower_name: string;
  sponsor: string;
  location: string;
  city: string;
  coordinates: [number, number];
  stage: DealStage;
  asset_type: string;
  description: string;
  loan_amount: number;
  currency: string;
  interest_rate: number;
  pik_spread: number;
  total_rate: number;
  origination_fee: number;
  exit_fee: number;
  tenor: number;
  maturity_date: string;
  disbursed_amount: number;
  outstanding_principal: number;
  accrued_pik: number;
  total_exposure: number;
  gdv: number;
  current_appraisal: number;
  total_units: number;
  total_area: number;
  construction_budget: number;
  construction_spent: number;
  construction_progress: number;
  land_cost: number;
  ltv: number;
  ltc: number;
  pre_sales_percent: number;
  developer_experience: string;
  developer_track_record: number;
  date_received: string;
  term_sheet_date: string | null;
  ic_approval_date: string | null;
  closing_date: string | null;
  first_drawdown_date: string | null;
  expected_maturity: string;
  screening_score: number | null;
  tags: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbDrawdown {
  id: string;
  deal_id: string;
  milestone: string;
  amount: number;
  scheduled_date: string;
  status: DrawdownStatus;
  construction_progress: number;
  created_at: string;
}

export interface DbCovenant {
  id: string;
  deal_id: string;
  name: string;
  metric: string;
  threshold: string;
  current_value: string;
  status: CovenantStatus;
  created_at: string;
  updated_at: string;
}

export interface DbUnitSale {
  id: string;
  deal_id: string;
  unit: string;
  type: string;
  area: number;
  list_price: number;
  status: UnitSaleStatus;
  sale_price: number | null;
  release_price: number | null;
  created_at: string;
  updated_at: string;
}

export interface DbScreeningCriteria {
  id: string;
  deal_id: string;
  label: string;
  pass: boolean;
  value: string;
  threshold: string;
}

export interface DbBorrower {
  id: string;
  name: string;
  group_name: string;
  type: "Developer" | "Sponsor" | "Developer & Sponsor";
  internal_rating: BorrowerRating;
  rating_date: string;
  headquarters: string;
  year_established: number;
  website: string | null;
  description: string;
  total_exposure: number;
  total_commitments: number;
  number_of_active_deals: number;
  avg_irr: number | null;
  avg_multiple: number | null;
  created_at: string;
  updated_at: string;
}

export interface DbBorrowerContact {
  id: string;
  borrower_id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface DbCorporateEntity {
  id: string;
  borrower_id: string;
  name: string;
  type: "SPV" | "Holding" | "Sponsor" | "UBO";
  jurisdiction: string;
  registration_number: string | null;
  ownership: string | null;
}

export interface DbKYCRecord {
  id: string;
  borrower_id: string;
  item: string;
  status: KYCStatus;
  last_checked: string | null;
  expiry_date: string | null;
  notes: string | null;
}

export interface DbCompletedProject {
  id: string;
  borrower_id: string;
  name: string;
  location: string;
  year: number;
  units: number;
  loan_amount: number;
  irr: number;
  multiple: number;
  days_delay: number;
  outcome: "on_time" | "minor_delay" | "significant_delay";
}

export interface DbDueDiligenceItem {
  id: string;
  deal_id: string;
  category: DDCategory;
  label: string;
  status: DDStatus;
  assignee: string | null;
  due_date: string | null;
  completed_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbDDDocument {
  id: string;
  dd_item_id: string;
  name: string;
  version: number;
  upload_date: string;
  storage_path: string | null;
}

export interface DbApprovalRecord {
  id: string;
  deal_id: string;
  ic_date: string;
  status: ApprovalStatus;
  cp_sign_off_approved: boolean | null;
  cp_sign_off_signed_by: string | null;
  cp_sign_off_date: string | null;
  cp_sign_off_conditions: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbICVote {
  id: string;
  approval_id: string;
  voter: string;
  role: string;
  decision: VoteDecision;
  conditions: string | null;
  date: string;
}

export interface DbLegalDocument {
  id: string;
  deal_id: string;
  name: string;
  type: string;
  status: LegalDocStatus;
  current_version: number;
  assigned_to: string;
  deadline: string | null;
  last_updated: string;
  notes: string | null;
}

export interface DbConditionPrecedent {
  id: string;
  deal_id: string;
  category: string;
  description: string;
  status: ConditionPrecedentStatus;
  verified_by: string | null;
  verified_date: string | null;
  notes: string | null;
}

export interface DbSecurityItem {
  id: string;
  deal_id: string;
  type: string;
  description: string;
  status: SecurityItemStatus;
  entity: string | null;
  registration_date: string | null;
  expiry_date: string | null;
  notes: string | null;
}

export interface DbTermSheet {
  id: string;
  deal_id: string;
  current_status: TermSheetStatus;
  current_version: number;
  issued_date: string | null;
  signed_date: string | null;
  exclusivity_end: string | null;
  cp_submitted: boolean;
  cp_submitted_date: string | null;
  cp_approved: boolean | null;
  cp_approved_by: string | null;
  cp_approved_date: string | null;
  cp_conditions: string[] | null;
  cp_memo_attached: boolean;
  cp_model_attached: boolean;
  facility: number;
  cash_rate: number;
  pik_spread: number;
  origination_fee: number;
  exit_fee: number;
  tenor: number;
  ltv_covenant: number;
  ltc_covenant: number;
  min_presales: number;
  security_package: string[];
  created_at: string;
  updated_at: string;
}

export interface DbTermSheetVersion {
  id: string;
  term_sheet_id: string;
  version: number;
  date: string;
  status: TermSheetStatus;
  updated_by: string;
  changes: string | null;
}

export interface DbWaiver {
  id: string;
  deal_id: string;
  covenant_name: string;
  request_date: string;
  reason: string;
  current_value: string;
  threshold: string;
  proposed_fee: number;
  fee_type: "flat" | "bps_on_outstanding";
  status: WaiverStatus;
  validity_period: string | null;
  internal_approved: boolean | null;
  internal_approved_by: string | null;
  internal_approved_date: string | null;
  cp_approved: boolean | null;
  cp_approved_by: string | null;
  cp_approved_date: string | null;
  cp_conditions: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface DbSiteVisit {
  id: string;
  deal_id: string;
  date: string;
  inspector: string;
  construction_progress: number;
  planning_progress: number;
  deviation: number;
  weather_conditions: string | null;
  workers_on_site: number | null;
  findings: string[];
  recommendation: SiteVisitRecommendation;
  notes: string | null;
  created_at: string;
}

export interface DbSiteVisitPhoto {
  id: string;
  site_visit_id: string;
  storage_path: string;
  caption: string;
}

export interface DbConstructionCertification {
  id: string;
  deal_id: string;
  cert_number: number;
  period: string;
  submitted_date: string;
  certified_amount: number;
  retention_percent: number;
  retention_amount: number;
  net_payable: number;
  cumulative_certified: number;
  cumulative_retention: number;
  status: CertificationStatus;
  approved_by: string | null;
  approved_date: string | null;
  linked_drawdown_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface DbMonitoringReport {
  id: string;
  deal_id: string;
  report_number: number;
  date: string;
  prepared_by: string;
  period: string;
  construction_progress: number;
  budget_utilization: number;
  schedule_status: ScheduleStatus;
  cost_status: CostStatus;
  quality_assessment: QualityAssessment;
  key_findings: string[];
  recommendation: string;
  next_milestone: string;
  next_milestone_date: string;
  drawdown_recommendation: "approve" | "hold" | "partial";
  drawdown_amount: number | null;
  created_at: string;
}

export interface DbAuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  user_id: string | null;
  user_name: string;
  detail: string | null;
  created_at: string;
}

// ===== SUPABASE DATABASE TYPE MAP =====

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: DbProfile;
        Insert: Omit<DbProfile, "created_at" | "updated_at">;
        Update: Partial<Omit<DbProfile, "id" | "created_at">>;
      };
      deals: {
        Row: DbDeal;
        Insert: Omit<DbDeal, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DbDeal, "id" | "created_at">>;
      };
      drawdowns: {
        Row: DbDrawdown;
        Insert: Omit<DbDrawdown, "id" | "created_at">;
        Update: Partial<Omit<DbDrawdown, "id" | "created_at">>;
      };
      covenants: {
        Row: DbCovenant;
        Insert: Omit<DbCovenant, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DbCovenant, "id" | "created_at">>;
      };
      unit_sales: {
        Row: DbUnitSale;
        Insert: Omit<DbUnitSale, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DbUnitSale, "id" | "created_at">>;
      };
      screening_criteria: {
        Row: DbScreeningCriteria;
        Insert: Omit<DbScreeningCriteria, "id">;
        Update: Partial<Omit<DbScreeningCriteria, "id">>;
      };
      borrowers: {
        Row: DbBorrower;
        Insert: Omit<DbBorrower, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DbBorrower, "id" | "created_at">>;
      };
      borrower_contacts: {
        Row: DbBorrowerContact;
        Insert: Omit<DbBorrowerContact, "id">;
        Update: Partial<Omit<DbBorrowerContact, "id">>;
      };
      corporate_entities: {
        Row: DbCorporateEntity;
        Insert: Omit<DbCorporateEntity, "id">;
        Update: Partial<Omit<DbCorporateEntity, "id">>;
      };
      kyc_records: {
        Row: DbKYCRecord;
        Insert: Omit<DbKYCRecord, "id">;
        Update: Partial<Omit<DbKYCRecord, "id">>;
      };
      completed_projects: {
        Row: DbCompletedProject;
        Insert: Omit<DbCompletedProject, "id">;
        Update: Partial<Omit<DbCompletedProject, "id">>;
      };
      due_diligence_items: {
        Row: DbDueDiligenceItem;
        Insert: Omit<DbDueDiligenceItem, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DbDueDiligenceItem, "id" | "created_at">>;
      };
      dd_documents: {
        Row: DbDDDocument;
        Insert: Omit<DbDDDocument, "id">;
        Update: Partial<Omit<DbDDDocument, "id">>;
      };
      approval_records: {
        Row: DbApprovalRecord;
        Insert: Omit<DbApprovalRecord, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DbApprovalRecord, "id" | "created_at">>;
      };
      ic_votes: {
        Row: DbICVote;
        Insert: Omit<DbICVote, "id">;
        Update: Partial<Omit<DbICVote, "id">>;
      };
      legal_documents: {
        Row: DbLegalDocument;
        Insert: Omit<DbLegalDocument, "id">;
        Update: Partial<Omit<DbLegalDocument, "id">>;
      };
      conditions_precedent: {
        Row: DbConditionPrecedent;
        Insert: Omit<DbConditionPrecedent, "id">;
        Update: Partial<Omit<DbConditionPrecedent, "id">>;
      };
      security_items: {
        Row: DbSecurityItem;
        Insert: Omit<DbSecurityItem, "id">;
        Update: Partial<Omit<DbSecurityItem, "id">>;
      };
      term_sheets: {
        Row: DbTermSheet;
        Insert: Omit<DbTermSheet, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DbTermSheet, "id" | "created_at">>;
      };
      term_sheet_versions: {
        Row: DbTermSheetVersion;
        Insert: Omit<DbTermSheetVersion, "id">;
        Update: Partial<Omit<DbTermSheetVersion, "id">>;
      };
      waivers: {
        Row: DbWaiver;
        Insert: Omit<DbWaiver, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DbWaiver, "id" | "created_at">>;
      };
      site_visits: {
        Row: DbSiteVisit;
        Insert: Omit<DbSiteVisit, "id" | "created_at">;
        Update: Partial<Omit<DbSiteVisit, "id" | "created_at">>;
      };
      site_visit_photos: {
        Row: DbSiteVisitPhoto;
        Insert: Omit<DbSiteVisitPhoto, "id">;
        Update: Partial<Omit<DbSiteVisitPhoto, "id">>;
      };
      construction_certifications: {
        Row: DbConstructionCertification;
        Insert: Omit<DbConstructionCertification, "id" | "created_at">;
        Update: Partial<Omit<DbConstructionCertification, "id" | "created_at">>;
      };
      monitoring_reports: {
        Row: DbMonitoringReport;
        Insert: Omit<DbMonitoringReport, "id" | "created_at">;
        Update: Partial<Omit<DbMonitoringReport, "id" | "created_at">>;
      };
      audit_logs: {
        Row: DbAuditLog;
        Insert: Omit<DbAuditLog, "id" | "created_at">;
        Update: never;
      };
    };
    Functions: Record<string, never>;
    Enums: {
      deal_stage: DealStage;
      covenant_status: CovenantStatus;
      drawdown_status: DrawdownStatus;
      unit_sale_status: UnitSaleStatus;
      dd_status: DDStatus;
      dd_category: DDCategory;
      vote_decision: VoteDecision;
      approval_status: ApprovalStatus;
      legal_doc_status: LegalDocStatus;
      cp_status: ConditionPrecedentStatus;
      security_status: SecurityItemStatus;
      term_sheet_status: TermSheetStatus;
      waiver_status: WaiverStatus;
      kyc_status: KYCStatus;
      borrower_rating: BorrowerRating;
      user_role: UserRole;
    };
  };
}

import { describe, it, expect } from "vitest";
import {
  dbDDItemToFrontend,
  dbICVoteToFrontend,
  dbApprovalToFrontend,
  dbLegalDocToFrontend,
  dbConditionPrecedentToFrontend,
  dbSecurityItemToFrontend,
  dbTermSheetToFrontend,
  dbWaiverToFrontend,
  dbSiteVisitToFrontend,
  dbCertificationToFrontend,
  dbMonitoringReportToFrontend,
} from "@/lib/dbConverters";
import type {
  DbDueDiligenceItem,
  DbICVote,
  DbApprovalRecord,
  DbLegalDocument,
  DbConditionPrecedent,
  DbSecurityItem,
  DbTermSheet,
  DbTermSheetVersion,
  DbWaiver,
  DbSiteVisit,
  DbConstructionCertification,
  DbMonitoringReport,
  DbAuditLog,
} from "@/types/database";

describe("dbConverters", () => {
  describe("dbDDItemToFrontend", () => {
    it("maps all fields and handles nulls", () => {
      const row: DbDueDiligenceItem = {
        id: "dd-1",
        deal_id: "deal-1",
        category: "technical",
        label: "Building license",
        status: "completed",
        assignee: "C. Moreno",
        due_date: null,
        completed_date: "2025-04-20",
        notes: null,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-04-20T00:00:00Z",
      };
      const result = dbDDItemToFrontend(row);
      expect(result).toEqual({
        id: "dd-1",
        category: "technical",
        label: "Building license",
        status: "completed",
        assignee: "C. Moreno",
        dueDate: undefined,
        completedDate: "2025-04-20",
        notes: undefined,
      });
    });

    it("preserves null assignee as undefined", () => {
      const row: DbDueDiligenceItem = {
        id: "dd-2",
        deal_id: "deal-1",
        category: "legal",
        label: "Title search",
        status: "pending",
        assignee: null,
        due_date: "2026-05-01",
        completed_date: null,
        notes: "Awaiting registry",
        created_at: "",
        updated_at: "",
      };
      const result = dbDDItemToFrontend(row);
      expect(result.assignee).toBeUndefined();
      expect(result.dueDate).toBe("2026-05-01");
      expect(result.notes).toBe("Awaiting registry");
    });
  });

  describe("dbICVoteToFrontend", () => {
    it("maps vote with conditions", () => {
      const row: DbICVote = {
        id: "v-1",
        approval_id: "a-1",
        voter: "J. Castillo",
        role: "CIO",
        decision: "approve_with_conditions",
        conditions: "40% pre-sales before 3rd drawdown",
        date: "2025-06-05",
      };
      expect(dbICVoteToFrontend(row)).toEqual({
        id: "v-1",
        voter: "J. Castillo",
        role: "CIO",
        decision: "approve_with_conditions",
        conditions: "40% pre-sales before 3rd drawdown",
        date: "2025-06-05",
      });
    });
  });

  describe("dbApprovalToFrontend", () => {
    const approvalRow: DbApprovalRecord = {
      id: "a-1",
      deal_id: "deal-1",
      ic_date: "2025-06-05",
      status: "approved",
      cp_sign_off_approved: true,
      cp_sign_off_signed_by: "N. Hartmann",
      cp_sign_off_date: "2025-06-10",
      cp_sign_off_conditions: null,
      created_at: "",
      updated_at: "",
    };

    it("builds full approval with votes and audit trail", () => {
      const votes: DbICVote[] = [
        { id: "v1", approval_id: "a-1", voter: "J. Castillo", role: "CIO", decision: "approve", conditions: null, date: "2025-06-05" },
      ];
      const audit: DbAuditLog[] = [
        { id: "l1", entity_type: "approval", entity_id: "a-1", action: "IC Approved", user_id: null, user_name: "System", detail: null, created_at: "2025-06-05T12:00:00Z" },
      ];
      const result = dbApprovalToFrontend(approvalRow, votes, audit);
      expect(result.status).toBe("approved");
      expect(result.votes).toHaveLength(1);
      expect(result.capitalPartnerSignOff?.signedBy).toBe("N. Hartmann");
      expect(result.auditTrail[0].date).toBe("2025-06-05");
    });

    it("omits CP sign-off when unsigned", () => {
      const row = { ...approvalRow, cp_sign_off_signed_by: null, cp_sign_off_approved: null, cp_sign_off_date: null };
      const result = dbApprovalToFrontend(row, [], []);
      expect(result.capitalPartnerSignOff).toBeUndefined();
    });
  });

  describe("dbLegalDocToFrontend", () => {
    it("maps fields correctly", () => {
      const row: DbLegalDocument = {
        id: "ld-1",
        deal_id: "deal-1",
        name: "Facility Agreement",
        type: "facility_agreement",
        status: "executed",
        current_version: 4,
        assigned_to: "Bufete Ibérico",
        deadline: null,
        last_updated: "2025-07-10",
        notes: null,
      };
      expect(dbLegalDocToFrontend(row)).toMatchObject({
        id: "ld-1",
        name: "Facility Agreement",
        status: "executed",
        currentVersion: 4,
        assignedTo: "Bufete Ibérico",
      });
    });
  });

  describe("dbConditionPrecedentToFrontend", () => {
    it("passes through status and verified info", () => {
      const row: DbConditionPrecedent = {
        id: "cp-1",
        deal_id: "deal-1",
        category: "Administrative",
        description: "Valid building license",
        status: "verified",
        verified_by: "C. Moreno",
        verified_date: "2025-06-20",
        notes: null,
      };
      const result = dbConditionPrecedentToFrontend(row);
      expect(result.status).toBe("verified");
      expect(result.verifiedBy).toBe("C. Moreno");
    });
  });

  describe("dbSecurityItemToFrontend", () => {
    it("maps fields and optional dates", () => {
      const row: DbSecurityItem = {
        id: "sp-1",
        deal_id: "deal-1",
        type: "First-Ranking Mortgage",
        description: "Mortgage over land",
        status: "executed",
        entity: "Solaris Promociones SL",
        registration_date: "2025-07-15",
        expiry_date: null,
        notes: null,
      };
      const result = dbSecurityItemToFrontend(row);
      expect(result.status).toBe("executed");
      expect(result.registrationDate).toBe("2025-07-15");
      expect(result.expiryDate).toBeUndefined();
    });
  });

  describe("dbTermSheetToFrontend", () => {
    const baseRow: DbTermSheet = {
      id: "ts-1",
      deal_id: "deal-1",
      current_status: "signed",
      current_version: 3,
      issued_date: "2025-04-28",
      signed_date: "2025-05-15",
      exclusivity_end: null,
      cp_submitted: true,
      cp_submitted_date: "2025-04-25",
      cp_approved: true,
      cp_approved_by: "K. Walsh",
      cp_approved_date: "2025-04-28",
      cp_conditions: ["40% pre-sales"],
      cp_memo_attached: true,
      cp_model_attached: true,
      facility: 14200000,
      cash_rate: 4.5,
      pik_spread: 4.5,
      origination_fee: 1.5,
      exit_fee: 0.75,
      tenor: 24,
      ltv_covenant: 65,
      ltc_covenant: 75,
      min_presales: 30,
      security_package: ["First-ranking mortgage"],
      created_at: "",
      updated_at: "",
    };

    it("builds term sheet with CP validation when submitted", () => {
      const versions: DbTermSheetVersion[] = [
        { id: "v1", term_sheet_id: "ts-1", version: 1, date: "2025-04-15", status: "draft", updated_by: "M. Rivera", changes: null },
      ];
      const result = dbTermSheetToFrontend(baseRow, versions, []);
      expect(result.keyTerms.facility).toBe(14200000);
      expect(result.keyTerms.ltv).toBe(65);
      expect(result.castlelakeValidation?.approvedBy).toBe("K. Walsh");
      expect(result.castlelakeValidation?.conditions).toEqual(["40% pre-sales"]);
      expect(result.versions).toHaveLength(1);
    });

    it("omits CP validation when not submitted", () => {
      const row = { ...baseRow, cp_submitted: false };
      const result = dbTermSheetToFrontend(row, [], []);
      expect(result.castlelakeValidation).toBeUndefined();
    });

    it("coerces numeric fields from strings", () => {
      const row = {
        ...baseRow,
        facility: "14200000" as unknown as number,
        cash_rate: "4.5" as unknown as number,
      };
      const result = dbTermSheetToFrontend(row, [], []);
      expect(result.keyTerms.facility).toBe(14200000);
      expect(result.keyTerms.cashRate).toBe(4.5);
    });
  });

  describe("dbWaiverToFrontend", () => {
    it("maps pending waiver with no approvals", () => {
      const row: DbWaiver = {
        id: "cw-1",
        deal_id: "deal-1",
        covenant_name: "Maximum LTV",
        request_date: "2026-03-28",
        reason: "LTV at 72.8%",
        current_value: "72.8%",
        threshold: "65%",
        proposed_fee: 25000,
        fee_type: "flat",
        status: "cp_review",
        validity_period: null,
        internal_approved: null,
        internal_approved_by: null,
        internal_approved_date: null,
        cp_approved: null,
        cp_approved_by: null,
        cp_approved_date: null,
        cp_conditions: null,
        created_at: "",
        updated_at: "",
      };
      const result = dbWaiverToFrontend(row);
      expect(result.status).toBe("cp_review");
      expect(result.internalApproval).toBeUndefined();
      expect(result.cpApproval).toBeUndefined();
      expect(result.proposedFee).toBe(25000);
    });

    it("builds approval blocks when set", () => {
      const row: DbWaiver = {
        id: "cw-2",
        deal_id: "deal-1",
        covenant_name: "Min pre-sales",
        request_date: "2026-03-01",
        reason: "Market slowdown",
        current_value: "22%",
        threshold: "30%",
        proposed_fee: 50000,
        fee_type: "bps_on_outstanding",
        status: "approved",
        validity_period: "3 months",
        internal_approved: true,
        internal_approved_by: "J. Castillo",
        internal_approved_date: "2026-03-10",
        cp_approved: true,
        cp_approved_by: "K. Walsh",
        cp_approved_date: "2026-03-15",
        cp_conditions: ["Review every 30 days"],
        created_at: "",
        updated_at: "",
      };
      const result = dbWaiverToFrontend(row);
      expect(result.internalApproval?.approvedBy).toBe("J. Castillo");
      expect(result.cpApproval?.conditions).toEqual(["Review every 30 days"]);
    });
  });

  describe("dbSiteVisitToFrontend", () => {
    it("maps fields and photos", () => {
      const row: DbSiteVisit = {
        id: "sv-1",
        deal_id: "deal-1",
        date: "2026-03-15",
        inspector: "Ing. Y. Soto",
        construction_progress: 72,
        planning_progress: 70,
        deviation: 2,
        weather_conditions: "Clear",
        workers_on_site: 45,
        findings: ["Facade 85%", "MEP on schedule"],
        recommendation: "proceed",
        notes: null,
        created_at: "",
      };
      const photos = [{ storage_path: "/path.jpg", caption: "West facade" }];
      const result = dbSiteVisitToFrontend(row, photos);
      expect(result.findings).toEqual(["Facade 85%", "MEP on schedule"]);
      expect(result.photos).toEqual([{ url: "/path.jpg", caption: "West facade" }]);
      expect(result.recommendation).toBe("proceed");
    });
  });

  describe("dbCertificationToFrontend", () => {
    it("converts numeric amounts", () => {
      const row: DbConstructionCertification = {
        id: "c-1",
        deal_id: "deal-1",
        cert_number: 1,
        period: "Aug-Sep 2025",
        submitted_date: "2025-10-05",
        certified_amount: 1850000,
        retention_percent: 5,
        retention_amount: 92500,
        net_payable: 1757500,
        cumulative_certified: 1850000,
        cumulative_retention: 92500,
        status: "paid",
        approved_by: "Ing. Y. Soto",
        approved_date: "2025-10-10",
        linked_drawdown_id: null,
        notes: null,
        created_at: "",
      };
      const result = dbCertificationToFrontend(row);
      expect(result.certifiedAmount).toBe(1850000);
      expect(result.status).toBe("paid");
    });
  });

  describe("dbMonitoringReportToFrontend", () => {
    it("handles null drawdown amount", () => {
      const row: DbMonitoringReport = {
        id: "m-1",
        deal_id: "deal-1",
        report_number: 1,
        date: "2026-03-15",
        prepared_by: "Surveyor",
        period: "Q1 2026",
        construction_progress: 72,
        budget_utilization: 68,
        schedule_status: "on_track",
        cost_status: "within_budget",
        quality_assessment: "satisfactory",
        key_findings: ["ok"],
        recommendation: "Continue",
        next_milestone: "M4",
        next_milestone_date: "2026-04-30",
        drawdown_recommendation: "hold",
        drawdown_amount: null,
        created_at: "",
      };
      const result = dbMonitoringReportToFrontend(row);
      expect(result.drawdownAmount).toBeUndefined();
      expect(result.scheduleStatus).toBe("on_track");
    });
  });
});

import type {
  DbDueDiligenceItem,
  DbApprovalRecord,
  DbICVote,
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
import type { DDItem, ApprovalRecord, ICVote, LegalDocument, ConditionPrecedent, SecurityItem } from "@/data/dealModules";
import type { TermSheet, EnhancedWaiver } from "@/data/termSheetData";
import type { SiteVisit, ConstructionCertification, MonitoringReport } from "@/data/constructionMonitoring";

export function dbDDItemToFrontend(row: DbDueDiligenceItem): DDItem {
  return {
    id: row.id,
    category: row.category,
    label: row.label,
    status: row.status,
    assignee: row.assignee ?? undefined,
    dueDate: row.due_date ?? undefined,
    completedDate: row.completed_date ?? undefined,
    notes: row.notes ?? undefined,
  };
}

export function dbICVoteToFrontend(row: DbICVote): ICVote {
  return {
    id: row.id,
    voter: row.voter,
    role: row.role,
    decision: row.decision,
    conditions: row.conditions ?? undefined,
    date: row.date,
  };
}

export function dbApprovalToFrontend(
  row: DbApprovalRecord,
  votes: DbICVote[],
  auditLogs: DbAuditLog[],
): ApprovalRecord {
  return {
    dealId: row.deal_id,
    icDate: row.ic_date,
    status: row.status,
    votes: votes.map(dbICVoteToFrontend),
    capitalPartnerSignOff: row.cp_sign_off_signed_by
      ? {
          approved: row.cp_sign_off_approved ?? false,
          signedBy: row.cp_sign_off_signed_by,
          date: row.cp_sign_off_date ?? "",
          conditions: row.cp_sign_off_conditions ?? undefined,
        }
      : undefined,
    auditTrail: auditLogs.map((log) => ({
      action: log.action,
      user: log.user_name,
      date: log.created_at.slice(0, 10),
      detail: log.detail ?? undefined,
    })),
  };
}

export function dbLegalDocToFrontend(row: DbLegalDocument): LegalDocument {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    status: row.status,
    currentVersion: row.current_version,
    assignedTo: row.assigned_to,
    deadline: row.deadline ?? undefined,
    lastUpdated: row.last_updated,
    notes: row.notes ?? undefined,
  };
}

export function dbConditionPrecedentToFrontend(row: DbConditionPrecedent): ConditionPrecedent {
  return {
    id: row.id,
    category: row.category,
    description: row.description,
    status: row.status,
    verifiedBy: row.verified_by ?? undefined,
    verifiedDate: row.verified_date ?? undefined,
    notes: row.notes ?? undefined,
  };
}

export function dbSecurityItemToFrontend(row: DbSecurityItem): SecurityItem {
  return {
    id: row.id,
    type: row.type,
    description: row.description,
    status: row.status,
    entity: row.entity ?? undefined,
    registrationDate: row.registration_date ?? undefined,
    expiryDate: row.expiry_date ?? undefined,
    notes: row.notes ?? undefined,
  };
}

export function dbTermSheetToFrontend(
  row: DbTermSheet,
  versions: DbTermSheetVersion[],
  auditLogs: DbAuditLog[],
): TermSheet {
  return {
    dealId: row.deal_id,
    currentStatus: row.current_status,
    currentVersion: row.current_version,
    issuedDate: row.issued_date ?? undefined,
    signedDate: row.signed_date ?? undefined,
    exclusivityEnd: row.exclusivity_end ?? undefined,
    castlelakeValidation: row.cp_submitted
      ? {
          submitted: row.cp_submitted,
          submittedDate: row.cp_submitted_date ?? undefined,
          approved: row.cp_approved ?? undefined,
          approvedBy: row.cp_approved_by ?? undefined,
          approvedDate: row.cp_approved_date ?? undefined,
          conditions: row.cp_conditions ?? undefined,
          memoAttached: row.cp_memo_attached,
          modelAttached: row.cp_model_attached,
        }
      : undefined,
    keyTerms: {
      facility: Number(row.facility),
      cashRate: Number(row.cash_rate),
      pikSpread: Number(row.pik_spread),
      originationFee: Number(row.origination_fee),
      exitFee: Number(row.exit_fee),
      tenor: row.tenor,
      ltv: Number(row.ltv_covenant),
      ltc: Number(row.ltc_covenant),
      minPresales: Number(row.min_presales),
      securityPackage: row.security_package ?? [],
    },
    versions: versions.map((v) => ({
      version: v.version,
      date: v.date,
      status: v.status,
      updatedBy: v.updated_by,
      changes: v.changes ?? undefined,
    })),
    auditTrail: auditLogs.map((log) => ({
      action: log.action,
      user: log.user_name,
      date: log.created_at.slice(0, 10),
      detail: log.detail ?? undefined,
    })),
  };
}

export function dbWaiverToFrontend(row: DbWaiver): EnhancedWaiver {
  return {
    id: row.id,
    dealId: row.deal_id,
    covenantName: row.covenant_name,
    requestDate: row.request_date,
    reason: row.reason,
    currentValue: row.current_value,
    threshold: row.threshold,
    proposedFee: Number(row.proposed_fee),
    feeType: row.fee_type,
    status: row.status,
    validityPeriod: row.validity_period ?? undefined,
    internalApproval:
      row.internal_approved != null
        ? {
            approved: row.internal_approved,
            approvedBy: row.internal_approved_by ?? "",
            date: row.internal_approved_date ?? "",
          }
        : undefined,
    cpApproval:
      row.cp_approved != null
        ? {
            approved: row.cp_approved,
            approvedBy: row.cp_approved_by ?? "",
            date: row.cp_approved_date ?? "",
            conditions: row.cp_conditions ?? undefined,
          }
        : undefined,
    auditTrail: [],
  };
}

export function dbSiteVisitToFrontend(
  row: DbSiteVisit,
  photos: { storage_path: string; caption: string }[] = [],
): SiteVisit {
  return {
    id: row.id,
    date: row.date,
    inspector: row.inspector,
    constructionProgress: row.construction_progress,
    planningProgress: row.planning_progress,
    deviation: Number(row.deviation),
    weatherConditions: row.weather_conditions ?? undefined,
    workersOnSite: row.workers_on_site ?? undefined,
    photos: photos.map((p) => ({ url: p.storage_path, caption: p.caption })),
    findings: row.findings ?? [],
    recommendation: row.recommendation,
    notes: row.notes ?? undefined,
  };
}

export function dbCertificationToFrontend(row: DbConstructionCertification): ConstructionCertification {
  return {
    id: row.id,
    certNumber: row.cert_number,
    period: row.period,
    submittedDate: row.submitted_date,
    certifiedAmount: Number(row.certified_amount),
    retentionPercent: Number(row.retention_percent),
    retentionAmount: Number(row.retention_amount),
    netPayable: Number(row.net_payable),
    cumulativeCertified: Number(row.cumulative_certified),
    cumulativeRetention: Number(row.cumulative_retention),
    status: row.status,
    approvedBy: row.approved_by ?? undefined,
    approvedDate: row.approved_date ?? undefined,
    linkedDrawdownId: row.linked_drawdown_id ?? undefined,
    notes: row.notes ?? undefined,
  };
}

export function dbMonitoringReportToFrontend(row: DbMonitoringReport): MonitoringReport {
  return {
    id: row.id,
    reportNumber: row.report_number,
    date: row.date,
    preparedBy: row.prepared_by,
    period: row.period,
    constructionProgress: row.construction_progress,
    budgetUtilization: Number(row.budget_utilization),
    scheduleStatus: row.schedule_status,
    costStatus: row.cost_status,
    qualityAssessment: row.quality_assessment,
    keyFindings: row.key_findings ?? [],
    recommendation: row.recommendation,
    nextMilestone: row.next_milestone,
    nextMilestoneDate: row.next_milestone_date,
    drawdownRecommendation: row.drawdown_recommendation,
    drawdownAmount: row.drawdown_amount != null ? Number(row.drawdown_amount) : undefined,
  };
}

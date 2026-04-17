/**
 * Shared "flatten-to-export-row" builders used by multiple pages.
 * Each builder returns plain objects whose keys become column headers.
 */
import type { Deal } from "@/data/sampleDeals";
import type { Borrower } from "@/data/borrowers";
import type { DDItem, ApprovalRecord, LegalDocument, ConditionPrecedent, SecurityItem } from "@/data/dealModules";
import type { TermSheet, EnhancedWaiver } from "@/data/termSheetData";
import type { SiteVisit, ConstructionCertification, MonitoringReport } from "@/data/constructionMonitoring";
import type { DealLifecycle } from "@/data/lifecyclePhases";

const round = (n: number, digits = 2) =>
  Math.round(n * Math.pow(10, digits)) / Math.pow(10, digits);

export function dealRow(d: Deal): Record<string, unknown> {
  return {
    Project: d.projectName,
    Borrower: d.borrower,
    Sponsor: d.sponsor,
    Location: d.location,
    Stage: d.stage,
    "Asset Type": d.assetType,
    "Loan Amount (EUR)": d.loanAmount,
    "Disbursed (EUR)": d.disbursedAmount,
    "Outstanding Principal (EUR)": d.outstandingPrincipal,
    "Accrued PIK (EUR)": d.accruedPIK,
    "Total Exposure (EUR)": d.totalExposure,
    "Cash Rate (%)": d.interestRate,
    "PIK Spread (%)": d.pikSpread,
    "Total Rate (%)": d.totalRate,
    "Tenor (months)": d.tenor,
    "GDV (EUR)": d.gdv,
    "LTV (%)": d.ltv,
    "LTC (%)": d.ltc,
    "Construction Progress (%)": d.constructionProgress,
    "Pre-Sales (%)": d.preSalesPercent,
    "Expected Maturity": d.expectedMaturity,
    Tags: d.tags.join(", "),
  };
}

export function borrowerRow(b: Borrower): Record<string, unknown> {
  const kycOk = b.kyc.every((k) => k.status === "valid");
  const kycStatus = kycOk
    ? "All valid"
    : b.kyc.some((k) => k.status === "expired" || k.status === "pending")
    ? "Action required"
    : "Expiring soon";
  return {
    Name: b.name,
    Group: b.group,
    Type: b.type,
    "Internal Rating": b.internalRating,
    Headquarters: b.headquarters,
    "Year Established": b.yearEstablished,
    "Active Deals": b.numberOfActiveDeals,
    "Total Commitments (EUR)": b.totalCommitments,
    "Total Exposure (EUR)": b.totalExposure,
    "Avg IRR (%)": b.avgIRR !== undefined ? round(b.avgIRR, 2) : "",
    "Completed Projects": b.completedProjects.length,
    "KYC Status": kycStatus,
  };
}

export function ddItemRow(dealName: string, item: DDItem): Record<string, unknown> {
  return {
    Deal: dealName,
    Category: item.category,
    Item: item.label,
    Status: item.status,
    Assignee: item.assignee ?? "",
    "Due Date": item.dueDate ?? "",
    "Completed Date": item.completedDate ?? "",
    Documents: (item.documents ?? []).map((d) => `${d.name} v${d.version}`).join("; "),
    Notes: item.notes ?? "",
  };
}

export function approvalRow(dealName: string, a: ApprovalRecord): Record<string, unknown> {
  const voteSummary = a.votes
    .map((v) => `${v.voter} (${v.role}): ${v.decision}`)
    .join("; ");
  return {
    Deal: dealName,
    "IC Date": a.icDate,
    Status: a.status,
    Votes: voteSummary,
    "Approve Votes": a.votes.filter((v) => v.decision === "approve").length,
    "Reject Votes": a.votes.filter((v) => v.decision === "reject").length,
    "Conditional Votes": a.votes.filter((v) => v.decision === "approve_with_conditions").length,
    "CP Sign-off": a.capitalPartnerSignOff
      ? `${a.capitalPartnerSignOff.approved ? "Approved" : "Rejected"} by ${a.capitalPartnerSignOff.signedBy} on ${a.capitalPartnerSignOff.date}`
      : "",
  };
}

export function icVoteRow(dealName: string, a: ApprovalRecord): Record<string, unknown>[] {
  return a.votes.map((v) => ({
    Deal: dealName,
    Voter: v.voter,
    Role: v.role,
    Decision: v.decision,
    Conditions: v.conditions ?? "",
    Date: v.date,
  }));
}

export function termSheetRow(dealName: string, ts: TermSheet): Record<string, unknown> {
  const kt = ts.keyTerms;
  return {
    Deal: dealName,
    Status: ts.currentStatus,
    Version: ts.currentVersion,
    Issued: ts.issuedDate ?? "",
    Signed: ts.signedDate ?? "",
    "Facility (EUR)": kt.facility,
    "Cash Rate (%)": kt.cashRate,
    "PIK Spread (%)": kt.pikSpread,
    "Total Rate (%)": round(kt.cashRate + kt.pikSpread, 2),
    "Origination Fee (%)": kt.originationFee,
    "Exit Fee (%)": kt.exitFee,
    "Tenor (months)": kt.tenor,
    "Max LTV (%)": kt.ltv,
    "Max LTC (%)": kt.ltc,
    "Min Pre-Sales (%)": kt.minPresales,
    "CP Approved": ts.castlelakeValidation?.approved === true
      ? "Yes"
      : ts.castlelakeValidation?.approved === false
      ? "No"
      : "Pending",
    "Security Package": kt.securityPackage.join(", "),
  };
}

export function waiverRow(dealName: string, w: EnhancedWaiver): Record<string, unknown> {
  return {
    Deal: dealName,
    Covenant: w.covenantName,
    "Request Date": w.requestDate,
    Status: w.status,
    "Current Value": w.currentValue,
    Threshold: w.threshold,
    "Proposed Fee (EUR)": w.proposedFee,
    "Fee Type": w.feeType,
    "Validity Period": w.validityPeriod ?? "",
    Reason: w.reason,
  };
}

export function legalDocRow(dealName: string, d: LegalDocument): Record<string, unknown> {
  return {
    Deal: dealName,
    Document: d.name,
    Type: d.type,
    Status: d.status,
    Version: d.currentVersion,
    "Assigned To": d.assignedTo,
    Deadline: d.deadline ?? "",
    "Last Updated": d.lastUpdated,
    Notes: d.notes ?? "",
  };
}

export function conditionPrecedentRow(dealName: string, c: ConditionPrecedent): Record<string, unknown> {
  return {
    Deal: dealName,
    Category: c.category,
    Description: c.description,
    Status: c.status,
    "Verified By": c.verifiedBy ?? "",
    "Verified Date": c.verifiedDate ?? "",
    Notes: c.notes ?? "",
  };
}

export function securityItemRow(dealName: string, s: SecurityItem): Record<string, unknown> {
  return {
    Deal: dealName,
    Type: s.type,
    Description: s.description,
    Status: s.status,
    Entity: s.entity ?? "",
    "Registration Date": s.registrationDate ?? "",
    "Expiry Date": s.expiryDate ?? "",
    Notes: s.notes ?? "",
  };
}

export function siteVisitRow(dealName: string, v: SiteVisit): Record<string, unknown> {
  return {
    Deal: dealName,
    Date: v.date,
    Inspector: v.inspector,
    "Construction Progress (%)": v.constructionProgress,
    "Planning Progress (%)": v.planningProgress,
    "Deviation (%)": v.deviation,
    "Workers On Site": v.workersOnSite ?? "",
    Weather: v.weatherConditions ?? "",
    Recommendation: v.recommendation,
    Findings: v.findings.join("; "),
    "Photos (count)": v.photos.length,
    Notes: v.notes ?? "",
  };
}

export function certificationRow(dealName: string, c: ConstructionCertification): Record<string, unknown> {
  return {
    Deal: dealName,
    "Cert #": c.certNumber,
    Period: c.period,
    Submitted: c.submittedDate,
    "Certified Amount (EUR)": c.certifiedAmount,
    "Retention %": c.retentionPercent,
    "Retention Amount (EUR)": c.retentionAmount,
    "Net Payable (EUR)": c.netPayable,
    "Cumulative Certified (EUR)": c.cumulativeCertified,
    "Cumulative Retention (EUR)": c.cumulativeRetention,
    Status: c.status,
    "Approved By": c.approvedBy ?? "",
    "Approved Date": c.approvedDate ?? "",
  };
}

export function monitoringReportRow(dealName: string, r: MonitoringReport): Record<string, unknown> {
  return {
    Deal: dealName,
    "Report #": r.reportNumber,
    Date: r.date,
    "Prepared By": r.preparedBy,
    Period: r.period,
    "Construction Progress (%)": r.constructionProgress,
    "Budget Utilization (%)": r.budgetUtilization,
    Schedule: r.scheduleStatus,
    Cost: r.costStatus,
    Quality: r.qualityAssessment,
    "Drawdown Recommendation": r.drawdownRecommendation,
    "Drawdown Amount (EUR)": r.drawdownAmount ?? "",
    Recommendation: r.recommendation,
    "Next Milestone": r.nextMilestone,
    "Next Milestone Date": r.nextMilestoneDate,
  };
}

export function lifecyclePhaseRow(dealName: string, lifecycle: DealLifecycle): Record<string, unknown>[] {
  return lifecycle.phases.map((p) => {
    const totalSubsteps = p.substeps.length;
    const doneSubsteps = p.substeps.filter((s) => s.status === "completed").length;
    const totalMilestones = p.milestones.length;
    const achievedMilestones = p.milestones.filter((m) => m.achieved).length;
    return {
      Deal: dealName,
      Phase: p.number,
      Name: p.name,
      Status: p.status,
      "Start Date": p.startDate ?? "",
      "Completed Date": p.completedDate ?? "",
      "Substeps Done": `${doneSubsteps}/${totalSubsteps}`,
      "Milestones Achieved": `${achievedMilestones}/${totalMilestones}`,
      Agents: p.agents.map((a) => a.name).join(", "),
      "Estimated Duration": p.estimatedDuration ?? "",
      Notes: p.notes ?? "",
    };
  });
}

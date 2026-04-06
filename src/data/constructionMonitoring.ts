// Construction Monitoring Module
// Site visits, certifications, monitoring reports, retenciones

export interface SiteVisit {
  id: string;
  date: string;
  inspector: string;
  constructionProgress: number;
  planningProgress: number; // planned % at this date
  deviation: number; // actual - planned
  weatherConditions?: string;
  workersOnSite?: number;
  photos: { url: string; caption: string }[];
  findings: string[];
  recommendation: "proceed" | "hold" | "review";
  notes?: string;
}

export interface ConstructionCertification {
  id: string;
  certNumber: number;
  period: string; // e.g. "Mar 2026"
  submittedDate: string;
  certifiedAmount: number;
  retentionPercent: number;
  retentionAmount: number;
  netPayable: number;
  cumulativeCertified: number;
  cumulativeRetention: number;
  status: "submitted" | "reviewed" | "approved" | "paid" | "disputed";
  approvedBy?: string;
  approvedDate?: string;
  linkedDrawdownId?: string;
  notes?: string;
}

export interface MonitoringReport {
  id: string;
  reportNumber: number;
  date: string;
  preparedBy: string;
  period: string;
  constructionProgress: number;
  budgetUtilization: number;
  scheduleStatus: "on_track" | "minor_delay" | "major_delay" | "ahead";
  costStatus: "within_budget" | "minor_overrun" | "major_overrun" | "under_budget";
  qualityAssessment: "satisfactory" | "needs_improvement" | "unsatisfactory";
  keyFindings: string[];
  recommendation: string;
  nextMilestone: string;
  nextMilestoneDate: string;
  drawdownRecommendation: "approve" | "hold" | "partial";
  drawdownAmount?: number;
}

export interface RetentionSchedule {
  dealId: string;
  retentionRate: number; // %
  totalRetained: number;
  totalReleased: number;
  retentionBalance: number;
  releaseConditions: string[];
  entries: {
    certId: string;
    certNumber: number;
    retainedAmount: number;
    status: "held" | "released";
    releaseDate?: string;
  }[];
}

// Sample data for deal-001 (Terrazas del Faro - active)
export const sampleSiteVisits: Record<string, SiteVisit[]> = {
  "deal-001": [
    {
      id: "sv-001", date: "2026-03-15", inspector: "Ing. Carlos Vega",
      constructionProgress: 72, planningProgress: 70, deviation: 2,
      weatherConditions: "Clear, 18°C", workersOnSite: 45,
      photos: [
        { url: "/placeholder.svg", caption: "West façade — cladding 85% complete" },
        { url: "/placeholder.svg", caption: "Pool area — excavation finished" },
        { url: "/placeholder.svg", caption: "Building B — MEP rough-in" },
      ],
      findings: [
        "Façade cladding progressing well, 85% complete on west elevation",
        "MEP rough-in on schedule in Building B",
        "Pool excavation complete, waterproofing next week",
        "Minor delay in elevator shaft — steel delivery pushed 1 week",
      ],
      recommendation: "proceed",
      notes: "Overall progress satisfactory. Minor elevator shaft delay will not affect critical path.",
    },
    {
      id: "sv-002", date: "2026-02-12", inspector: "Ing. Carlos Vega",
      constructionProgress: 65, planningProgress: 62, deviation: 3,
      weatherConditions: "Partly cloudy, 15°C", workersOnSite: 42,
      photos: [
        { url: "/placeholder.svg", caption: "Structure complete — all floors" },
        { url: "/placeholder.svg", caption: "Interior partition walls" },
      ],
      findings: [
        "Structural frame 100% complete",
        "Partition walls advancing in Building A, floor 3-4",
        "Electrical rough-in started in Building A lower floors",
        "Waterproofing of roof completed last week",
      ],
      recommendation: "proceed",
    },
    {
      id: "sv-003", date: "2026-01-10", inspector: "Ing. Carlos Vega",
      constructionProgress: 58, planningProgress: 55, deviation: 3,
      weatherConditions: "Rain, 12°C", workersOnSite: 38,
      photos: [
        { url: "/placeholder.svg", caption: "Building A — 4th floor slab poured" },
      ],
      findings: [
        "Building A structure complete to 4th floor",
        "Building B structure at 3rd floor level",
        "Underground parking waterproofing complete",
        "Weather causing minor delays in exterior work",
      ],
      recommendation: "proceed",
    },
  ],
};

export const sampleCertifications: Record<string, ConstructionCertification[]> = {
  "deal-001": [
    {
      id: "cert-001", certNumber: 1, period: "Aug-Sep 2025",
      submittedDate: "2025-10-05", certifiedAmount: 1850000,
      retentionPercent: 5, retentionAmount: 92500, netPayable: 1757500,
      cumulativeCertified: 1850000, cumulativeRetention: 92500,
      status: "paid", approvedBy: "Ing. Carlos Vega", approvedDate: "2025-10-10",
      linkedDrawdownId: "dd-001-1",
    },
    {
      id: "cert-002", certNumber: 2, period: "Oct-Nov 2025",
      submittedDate: "2025-12-02", certifiedAmount: 2640000,
      retentionPercent: 5, retentionAmount: 132000, netPayable: 2508000,
      cumulativeCertified: 4490000, cumulativeRetention: 224500,
      status: "paid", approvedBy: "Ing. Carlos Vega", approvedDate: "2025-12-08",
      linkedDrawdownId: "dd-001-2",
    },
    {
      id: "cert-003", certNumber: 3, period: "Dec 2025-Feb 2026",
      submittedDate: "2026-03-05", certifiedAmount: 3150000,
      retentionPercent: 5, retentionAmount: 157500, netPayable: 2992500,
      cumulativeCertified: 7640000, cumulativeRetention: 382000,
      status: "paid", approvedBy: "Ing. Carlos Vega", approvedDate: "2026-03-12",
      linkedDrawdownId: "dd-001-3",
    },
    {
      id: "cert-004", certNumber: 4, period: "Mar-Apr 2026",
      submittedDate: "2026-04-02", certifiedAmount: 2100000,
      retentionPercent: 5, retentionAmount: 105000, netPayable: 1995000,
      cumulativeCertified: 9740000, cumulativeRetention: 487000,
      status: "submitted",
      notes: "Pending monitoring surveyor review",
    },
  ],
};

export const sampleMonitoringReports: Record<string, MonitoringReport[]> = {
  "deal-001": [
    {
      id: "mr-003", reportNumber: 3, date: "2026-03-20", preparedBy: "Ing. Carlos Vega",
      period: "Q1 2026", constructionProgress: 72, budgetUtilization: 68,
      scheduleStatus: "on_track", costStatus: "within_budget",
      qualityAssessment: "satisfactory",
      keyFindings: [
        "Construction progress at 72%, 2% ahead of planned schedule",
        "Budget utilization at 68% — €10.74M spent of €15.8M budget",
        "Pre-sales at 47%, exceeding covenant threshold of 30%",
        "Structural works complete; now in façade and interior fit-out phase",
        "Minor delay in elevator installation — non-critical path, 1 week",
      ],
      recommendation: "Project progressing satisfactorily. Recommend approval of Certification #4 and next drawdown tranche.",
      nextMilestone: "Interior finishes & fit-out (Drawdown 4)",
      nextMilestoneDate: "2026-08-01",
      drawdownRecommendation: "approve",
      drawdownAmount: 2560000,
    },
    {
      id: "mr-002", reportNumber: 2, date: "2025-12-15", preparedBy: "Ing. Carlos Vega",
      period: "Q4 2025", constructionProgress: 55, budgetUtilization: 48,
      scheduleStatus: "on_track", costStatus: "within_budget",
      qualityAssessment: "satisfactory",
      keyFindings: [
        "Structural frame advancing on schedule",
        "Underground parking completed",
        "MEP rough-in started",
      ],
      recommendation: "Recommend continued disbursement per schedule.",
      nextMilestone: "Envelope, MEP & rough-in (Drawdown 3)",
      nextMilestoneDate: "2026-03-15",
      drawdownRecommendation: "approve",
      drawdownAmount: 3140000,
    },
  ],
};

export const sampleRetentions: Record<string, RetentionSchedule> = {
  "deal-001": {
    dealId: "deal-001",
    retentionRate: 5,
    totalRetained: 487000,
    totalReleased: 0,
    retentionBalance: 487000,
    releaseConditions: [
      "Certificate of completion (final de obra)",
      "First occupancy license (licencia de primera ocupación)",
      "Defect-free inspection by monitoring surveyor",
      "All liens and encumbrances settled",
    ],
    entries: [
      { certId: "cert-001", certNumber: 1, retainedAmount: 92500, status: "held" },
      { certId: "cert-002", certNumber: 2, retainedAmount: 132000, status: "held" },
      { certId: "cert-003", certNumber: 3, retainedAmount: 157500, status: "held" },
      { certId: "cert-004", certNumber: 4, retainedAmount: 105000, status: "held" },
    ],
  },
};

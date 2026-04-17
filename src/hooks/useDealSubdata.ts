import { isSupabaseConfigured } from "@/lib/supabase";
import {
  useDueDiligenceItems,
  useApprovalRecord,
  useICVotes,
  useLegalDocuments,
  useConditionsPrecedent,
  useSecurityItems,
  useTermSheet,
  useTermSheetVersions,
  useWaivers,
  useSiteVisits,
  useConstructionCertifications,
  useMonitoringReports,
  useAuditLogs,
} from "@/hooks/useSupabaseQuery";
import {
  sampleDueDiligence,
  sampleApprovals,
  sampleLegalDocs,
  sampleConditionsPrecedent,
  sampleSecurityPackages,
} from "@/data/dealModules";
import { sampleTermSheets, sampleEnhancedWaivers } from "@/data/termSheetData";
import {
  sampleSiteVisits,
  sampleCertifications,
  sampleMonitoringReports,
} from "@/data/constructionMonitoring";
import type { DDItem, ApprovalRecord, LegalDocument, ConditionPrecedent, SecurityItem } from "@/data/dealModules";
import type { TermSheet, EnhancedWaiver } from "@/data/termSheetData";
import type { SiteVisit, ConstructionCertification, MonitoringReport } from "@/data/constructionMonitoring";
import {
  dbDDItemToFrontend,
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

type DualResult<T> = { data: T; loading: boolean; isLive: boolean };

export function useDDItemsForDeal(dealId: string): DualResult<DDItem[]> {
  const isLive = isSupabaseConfigured();
  const query = useDueDiligenceItems(dealId);
  if (isLive) {
    return {
      data: (query.data ?? []).map(dbDDItemToFrontend),
      loading: query.isLoading,
      isLive: true,
    };
  }
  return { data: sampleDueDiligence[dealId] ?? [], loading: false, isLive: false };
}

export function useApprovalForDeal(dealId: string): DualResult<ApprovalRecord | null> {
  const isLive = isSupabaseConfigured();
  const approvalQuery = useApprovalRecord(dealId);
  const approvalId = approvalQuery.data?.id ?? "";
  const votesQuery = useICVotes(approvalId);
  const auditQuery = useAuditLogs("approval", approvalId);

  if (isLive) {
    if (!approvalQuery.data) {
      return { data: null, loading: approvalQuery.isLoading, isLive: true };
    }
    return {
      data: dbApprovalToFrontend(
        approvalQuery.data,
        votesQuery.data ?? [],
        auditQuery.data ?? [],
      ),
      loading: approvalQuery.isLoading || votesQuery.isLoading,
      isLive: true,
    };
  }
  return { data: sampleApprovals[dealId] ?? null, loading: false, isLive: false };
}

export function useLegalDocsForDeal(dealId: string): DualResult<LegalDocument[]> {
  const isLive = isSupabaseConfigured();
  const query = useLegalDocuments(dealId);
  if (isLive) {
    return {
      data: (query.data ?? []).map(dbLegalDocToFrontend),
      loading: query.isLoading,
      isLive: true,
    };
  }
  return { data: sampleLegalDocs[dealId] ?? [], loading: false, isLive: false };
}

export function useConditionsPrecedentForDeal(dealId: string): DualResult<ConditionPrecedent[]> {
  const isLive = isSupabaseConfigured();
  const query = useConditionsPrecedent(dealId);
  if (isLive) {
    return {
      data: (query.data ?? []).map(dbConditionPrecedentToFrontend),
      loading: query.isLoading,
      isLive: true,
    };
  }
  return { data: sampleConditionsPrecedent[dealId] ?? [], loading: false, isLive: false };
}

export function useSecurityItemsForDeal(dealId: string): DualResult<SecurityItem[]> {
  const isLive = isSupabaseConfigured();
  const query = useSecurityItems(dealId);
  if (isLive) {
    return {
      data: (query.data ?? []).map(dbSecurityItemToFrontend),
      loading: query.isLoading,
      isLive: true,
    };
  }
  return { data: sampleSecurityPackages[dealId] ?? [], loading: false, isLive: false };
}

export function useTermSheetForDeal(dealId: string): DualResult<TermSheet | null> {
  const isLive = isSupabaseConfigured();
  const tsQuery = useTermSheet(dealId);
  const termSheetId = tsQuery.data?.id ?? "";
  const versionsQuery = useTermSheetVersions(termSheetId);
  const auditQuery = useAuditLogs("term_sheet", termSheetId);

  if (isLive) {
    if (!tsQuery.data) {
      return { data: null, loading: tsQuery.isLoading, isLive: true };
    }
    return {
      data: dbTermSheetToFrontend(
        tsQuery.data,
        versionsQuery.data ?? [],
        auditQuery.data ?? [],
      ),
      loading: tsQuery.isLoading || versionsQuery.isLoading,
      isLive: true,
    };
  }
  return { data: sampleTermSheets[dealId] ?? null, loading: false, isLive: false };
}

export function useWaiversForDeal(dealId: string): DualResult<EnhancedWaiver[]> {
  const isLive = isSupabaseConfigured();
  const query = useWaivers(dealId);
  if (isLive) {
    return {
      data: (query.data ?? []).map(dbWaiverToFrontend),
      loading: query.isLoading,
      isLive: true,
    };
  }
  return { data: sampleEnhancedWaivers[dealId] ?? [], loading: false, isLive: false };
}

export function useSiteVisitsForDeal(dealId: string): DualResult<SiteVisit[]> {
  const isLive = isSupabaseConfigured();
  const query = useSiteVisits(dealId);
  if (isLive) {
    return {
      data: (query.data ?? []).map((v) => dbSiteVisitToFrontend(v)),
      loading: query.isLoading,
      isLive: true,
    };
  }
  return { data: sampleSiteVisits[dealId] ?? [], loading: false, isLive: false };
}

export function useCertificationsForDeal(dealId: string): DualResult<ConstructionCertification[]> {
  const isLive = isSupabaseConfigured();
  const query = useConstructionCertifications(dealId);
  if (isLive) {
    return {
      data: (query.data ?? []).map(dbCertificationToFrontend),
      loading: query.isLoading,
      isLive: true,
    };
  }
  return { data: sampleCertifications[dealId] ?? [], loading: false, isLive: false };
}

export function useMonitoringReportsForDeal(dealId: string): DualResult<MonitoringReport[]> {
  const isLive = isSupabaseConfigured();
  const query = useMonitoringReports(dealId);
  if (isLive) {
    return {
      data: (query.data ?? []).map(dbMonitoringReportToFrontend),
      loading: query.isLoading,
      isLive: true,
    };
  }
  return { data: sampleMonitoringReports[dealId] ?? [], loading: false, isLive: false };
}

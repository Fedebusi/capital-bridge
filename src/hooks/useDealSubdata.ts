import { useQuery } from "@tanstack/react-query";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
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
  useDealLifecycle,
  useLifecyclePhases,
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
import { sampleLifecycles } from "@/data/lifecyclePhases";
import type { DDItem, ApprovalRecord, LegalDocument, ConditionPrecedent, SecurityItem } from "@/data/dealModules";
import type { TermSheet, EnhancedWaiver } from "@/data/termSheetData";
import type { SiteVisit, ConstructionCertification, MonitoringReport } from "@/data/constructionMonitoring";
import type { DealLifecycle } from "@/data/lifecyclePhases";
import type { DbPhaseSubstep, DbPhaseMilestone } from "@/types/database";
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
  dbLifecycleToFrontend,
} from "@/lib/dbConverters";

type DualResult<T> = { data: T; loading: boolean; isLive: boolean };

export function useDDItemsForDeal(dealId: string): DualResult<DDItem[]> {
  const isLive = isSupabaseConfigured();
  const query = useDueDiligenceItems(dealId);
  const sample = sampleDueDiligence[dealId] ?? [];
  if (isLive) {
    const live = (query.data ?? []).map(dbDDItemToFrontend);
    // Fallback to sample data when live DB is empty but demo has content
    return {
      data: live.length > 0 ? live : sample,
      loading: query.isLoading,
      isLive: true,
    };
  }
  return { data: sample, loading: false, isLive: false };
}

export function useApprovalForDeal(dealId: string): DualResult<ApprovalRecord | null> {
  const isLive = isSupabaseConfigured();
  const approvalQuery = useApprovalRecord(dealId);
  const approvalId = approvalQuery.data?.id ?? "";
  const votesQuery = useICVotes(approvalId);
  const auditQuery = useAuditLogs("approval", approvalId);

  const sample = sampleApprovals[dealId] ?? null;
  if (isLive) {
    if (!approvalQuery.data) {
      // Fallback to sample when live DB has no approval record
      return { data: sample, loading: approvalQuery.isLoading, isLive: true };
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
  return { data: sample, loading: false, isLive: false };
}

export function useLegalDocsForDeal(dealId: string): DualResult<LegalDocument[]> {
  const isLive = isSupabaseConfigured();
  const query = useLegalDocuments(dealId);
  const sample = sampleLegalDocs[dealId] ?? [];
  if (isLive) {
    const live = (query.data ?? []).map(dbLegalDocToFrontend);
    return { data: live.length > 0 ? live : sample, loading: query.isLoading, isLive: true };
  }
  return { data: sample, loading: false, isLive: false };
}

export function useConditionsPrecedentForDeal(dealId: string): DualResult<ConditionPrecedent[]> {
  const isLive = isSupabaseConfigured();
  const query = useConditionsPrecedent(dealId);
  const sample = sampleConditionsPrecedent[dealId] ?? [];
  if (isLive) {
    const live = (query.data ?? []).map(dbConditionPrecedentToFrontend);
    return { data: live.length > 0 ? live : sample, loading: query.isLoading, isLive: true };
  }
  return { data: sample, loading: false, isLive: false };
}

export function useSecurityItemsForDeal(dealId: string): DualResult<SecurityItem[]> {
  const isLive = isSupabaseConfigured();
  const query = useSecurityItems(dealId);
  const sample = sampleSecurityPackages[dealId] ?? [];
  if (isLive) {
    const live = (query.data ?? []).map(dbSecurityItemToFrontend);
    return { data: live.length > 0 ? live : sample, loading: query.isLoading, isLive: true };
  }
  return { data: sample, loading: false, isLive: false };
}

export function useTermSheetForDeal(dealId: string): DualResult<TermSheet | null> {
  const isLive = isSupabaseConfigured();
  const tsQuery = useTermSheet(dealId);
  const termSheetId = tsQuery.data?.id ?? "";
  const versionsQuery = useTermSheetVersions(termSheetId);
  const auditQuery = useAuditLogs("term_sheet", termSheetId);
  const sample = sampleTermSheets[dealId] ?? null;

  if (isLive) {
    if (!tsQuery.data) {
      // Fallback to sample term sheet when live DB has none
      return { data: sample, loading: tsQuery.isLoading, isLive: true };
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
  return { data: sample, loading: false, isLive: false };
}

export function useWaiversForDeal(dealId: string): DualResult<EnhancedWaiver[]> {
  const isLive = isSupabaseConfigured();
  const query = useWaivers(dealId);
  const sample = sampleEnhancedWaivers[dealId] ?? [];
  if (isLive) {
    const live = (query.data ?? []).map(dbWaiverToFrontend);
    return { data: live.length > 0 ? live : sample, loading: query.isLoading, isLive: true };
  }
  return { data: sample, loading: false, isLive: false };
}

export function useSiteVisitsForDeal(dealId: string): DualResult<SiteVisit[]> {
  const isLive = isSupabaseConfigured();
  const query = useSiteVisits(dealId);
  const sample = sampleSiteVisits[dealId] ?? [];
  if (isLive) {
    const live = (query.data ?? []).map((v) => dbSiteVisitToFrontend(v));
    return { data: live.length > 0 ? live : sample, loading: query.isLoading, isLive: true };
  }
  return { data: sample, loading: false, isLive: false };
}

export function useCertificationsForDeal(dealId: string): DualResult<ConstructionCertification[]> {
  const isLive = isSupabaseConfigured();
  const query = useConstructionCertifications(dealId);
  const sample = sampleCertifications[dealId] ?? [];
  if (isLive) {
    const live = (query.data ?? []).map(dbCertificationToFrontend);
    return { data: live.length > 0 ? live : sample, loading: query.isLoading, isLive: true };
  }
  return { data: sample, loading: false, isLive: false };
}

export function useLifecycleForDeal(dealId: string): DualResult<DealLifecycle | null> {
  const isLive = isSupabaseConfigured();
  const lifecycleQuery = useDealLifecycle(dealId);
  const lifecycleId = lifecycleQuery.data?.id ?? "";
  const phasesQuery = useLifecyclePhases(lifecycleId);
  const phases = phasesQuery.data ?? [];
  const phaseIds = phases.map((p) => p.id);
  const phaseIdsKey = phaseIds.join(",");

  // Batch-fetch substeps and milestones for all phases in a single query each.
  const substepsQuery = useQuery({
    queryKey: ["phase_substeps_bulk", lifecycleId, phaseIdsKey],
    queryFn: async (): Promise<DbPhaseSubstep[]> => {
      if (!isSupabaseConfigured() || phaseIds.length === 0) return [];
      const { data, error } = await supabase!
        .from("phase_substeps")
        .select("*")
        .in("phase_id", phaseIds)
        .order("created_at");
      if (error) throw error;
      return data as DbPhaseSubstep[];
    },
    enabled: isSupabaseConfigured() && phaseIds.length > 0,
  });

  const milestonesQuery = useQuery({
    queryKey: ["phase_milestones_bulk", lifecycleId, phaseIdsKey],
    queryFn: async (): Promise<DbPhaseMilestone[]> => {
      if (!isSupabaseConfigured() || phaseIds.length === 0) return [];
      const { data, error } = await supabase!
        .from("phase_milestones")
        .select("*")
        .in("phase_id", phaseIds)
        .order("created_at");
      if (error) throw error;
      return data as DbPhaseMilestone[];
    },
    enabled: isSupabaseConfigured() && phaseIds.length > 0,
  });

  const sampleLifecycle = sampleLifecycles[dealId] ?? null;
  if (isLive) {
    if (!lifecycleQuery.data) {
      // Fallback to sample lifecycle when live DB has none
      return { data: sampleLifecycle, loading: lifecycleQuery.isLoading, isLive: true };
    }
    const substepsByPhase: Record<string, DbPhaseSubstep[]> = {};
    for (const s of substepsQuery.data ?? []) {
      (substepsByPhase[s.phase_id] ??= []).push(s);
    }
    const milestonesByPhase: Record<string, DbPhaseMilestone[]> = {};
    for (const m of milestonesQuery.data ?? []) {
      (milestonesByPhase[m.phase_id] ??= []).push(m);
    }
    return {
      data: dbLifecycleToFrontend(
        lifecycleQuery.data,
        phases,
        substepsByPhase,
        milestonesByPhase,
      ),
      loading:
        lifecycleQuery.isLoading ||
        phasesQuery.isLoading ||
        substepsQuery.isLoading ||
        milestonesQuery.isLoading,
      isLive: true,
    };
  }
  return { data: sampleLifecycle, loading: false, isLive: false };
}

export function useMonitoringReportsForDeal(dealId: string): DualResult<MonitoringReport[]> {
  const isLive = isSupabaseConfigured();
  const query = useMonitoringReports(dealId);
  const sample = sampleMonitoringReports[dealId] ?? [];
  if (isLive) {
    const live = (query.data ?? []).map(dbMonitoringReportToFrontend);
    return { data: live.length > 0 ? live : sample, loading: query.isLoading, isLive: true };
  }
  return { data: sample, loading: false, isLive: false };
}

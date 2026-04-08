import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type {
  DbDeal, DbBorrower, DbDrawdown, DbCovenant, DbUnitSale,
  DbScreeningCriteria, DbDueDiligenceItem, DbDDDocument,
  DbApprovalRecord, DbICVote, DbLegalDocument, DbConditionPrecedent,
  DbSecurityItem, DbTermSheet, DbTermSheetVersion, DbWaiver,
  DbSiteVisit, DbConstructionCertification, DbMonitoringReport,
  DbBorrowerContact, DbCorporateEntity, DbKYCRecord, DbCompletedProject,
  DbAuditLog,
} from "@/types/database";

// ===== DEALS =====

export function useDealsQuery() {
  return useQuery({
    queryKey: ["deals"],
    queryFn: async (): Promise<DbDeal[]> => {
      if (!isSupabaseConfigured()) return [];
      const { data, error } = await supabase!
        .from("deals")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DbDeal[];
    },
    enabled: isSupabaseConfigured(),
  });
}

export function useDealQuery(dealId: string) {
  return useQuery({
    queryKey: ["deals", dealId],
    queryFn: async (): Promise<DbDeal | null> => {
      if (!isSupabaseConfigured()) return null;
      const { data, error } = await supabase!
        .from("deals")
        .select("*")
        .eq("id", dealId)
        .single();
      if (error) throw error;
      return data as DbDeal;
    },
    enabled: isSupabaseConfigured() && !!dealId,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (deal: Omit<DbDeal, "id" | "created_at" | "updated_at">) => {
      if (!isSupabaseConfigured()) throw new Error("Supabase not configured");
      const { data, error } = await supabase!
        .from("deals")
        .insert({ ...deal, created_by: user?.id ?? null })
        .select()
        .single();
      if (error) throw error;

      // Audit log
      await supabase!.from("audit_logs").insert({
        entity_type: "deal",
        entity_id: data.id,
        action: "created",
        user_id: user?.id ?? null,
        user_name: user?.email ?? "System",
        detail: `Deal "${deal.project_name}" created`,
      });

      return data as DbDeal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DbDeal> & { id: string }) => {
      if (!isSupabaseConfigured()) throw new Error("Supabase not configured");
      const { data, error } = await supabase!
        .from("deals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;

      await supabase!.from("audit_logs").insert({
        entity_type: "deal",
        entity_id: id,
        action: "updated",
        user_id: user?.id ?? null,
        user_name: user?.email ?? "System",
        detail: `Deal updated: ${Object.keys(updates).join(", ")}`,
      });

      return data as DbDeal;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deals", data.id] });
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!isSupabaseConfigured()) throw new Error("Supabase not configured");
      const { error } = await supabase!.from("deals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}

// ===== DEAL SUB-ENTITIES =====

export function useDrawdowns(dealId: string) {
  return useQuery({
    queryKey: ["drawdowns", dealId],
    queryFn: async (): Promise<DbDrawdown[]> => {
      if (!isSupabaseConfigured()) return [];
      const { data, error } = await supabase!
        .from("drawdowns")
        .select("*")
        .eq("deal_id", dealId)
        .order("scheduled_date");
      if (error) throw error;
      return data as DbDrawdown[];
    },
    enabled: isSupabaseConfigured() && !!dealId,
  });
}

export function useCovenants(dealId: string) {
  return useQuery({
    queryKey: ["covenants", dealId],
    queryFn: async (): Promise<DbCovenant[]> => {
      if (!isSupabaseConfigured()) return [];
      const { data, error } = await supabase!
        .from("covenants")
        .select("*")
        .eq("deal_id", dealId);
      if (error) throw error;
      return data as DbCovenant[];
    },
    enabled: isSupabaseConfigured() && !!dealId,
  });
}

export function useUnitSales(dealId: string) {
  return useQuery({
    queryKey: ["unit_sales", dealId],
    queryFn: async (): Promise<DbUnitSale[]> => {
      if (!isSupabaseConfigured()) return [];
      const { data, error } = await supabase!
        .from("unit_sales")
        .select("*")
        .eq("deal_id", dealId);
      if (error) throw error;
      return data as DbUnitSale[];
    },
    enabled: isSupabaseConfigured() && !!dealId,
  });
}

export function useScreeningCriteria(dealId: string) {
  return useQuery({
    queryKey: ["screening_criteria", dealId],
    queryFn: async (): Promise<DbScreeningCriteria[]> => {
      if (!isSupabaseConfigured()) return [];
      const { data, error } = await supabase!
        .from("screening_criteria")
        .select("*")
        .eq("deal_id", dealId);
      if (error) throw error;
      return data as DbScreeningCriteria[];
    },
    enabled: isSupabaseConfigured() && !!dealId,
  });
}

// ===== BORROWERS =====

export function useBorrowersQuery() {
  return useQuery({
    queryKey: ["borrowers"],
    queryFn: async (): Promise<DbBorrower[]> => {
      if (!isSupabaseConfigured()) return [];
      const { data, error } = await supabase!
        .from("borrowers")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as DbBorrower[];
    },
    enabled: isSupabaseConfigured(),
  });
}

export function useBorrowerQuery(borrowerId: string) {
  return useQuery({
    queryKey: ["borrowers", borrowerId],
    queryFn: async (): Promise<DbBorrower | null> => {
      if (!isSupabaseConfigured()) return null;
      const { data, error } = await supabase!
        .from("borrowers")
        .select("*")
        .eq("id", borrowerId)
        .single();
      if (error) throw error;
      return data as DbBorrower;
    },
    enabled: isSupabaseConfigured() && !!borrowerId,
  });
}

export function useCreateBorrower() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (borrower: Omit<DbBorrower, "id" | "created_at" | "updated_at">) => {
      if (!isSupabaseConfigured()) throw new Error("Supabase not configured");
      const { data, error } = await supabase!
        .from("borrowers")
        .insert(borrower)
        .select()
        .single();
      if (error) throw error;

      await supabase!.from("audit_logs").insert({
        entity_type: "borrower",
        entity_id: data.id,
        action: "created",
        user_id: user?.id ?? null,
        user_name: user?.email ?? "System",
        detail: `Borrower "${borrower.name}" created`,
      });

      return data as DbBorrower;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrowers"] });
    },
  });
}

export function useUpdateBorrower() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DbBorrower> & { id: string }) => {
      if (!isSupabaseConfigured()) throw new Error("Supabase not configured");
      const { data, error } = await supabase!
        .from("borrowers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as DbBorrower;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["borrowers"] });
      queryClient.invalidateQueries({ queryKey: ["borrowers", data.id] });
    },
  });
}

// ===== BORROWER SUB-ENTITIES =====

export function useBorrowerContacts(borrowerId: string) {
  return useQuery({
    queryKey: ["borrower_contacts", borrowerId],
    queryFn: async (): Promise<DbBorrowerContact[]> => {
      if (!isSupabaseConfigured()) return [];
      const { data, error } = await supabase!
        .from("borrower_contacts")
        .select("*")
        .eq("borrower_id", borrowerId);
      if (error) throw error;
      return data as DbBorrowerContact[];
    },
    enabled: isSupabaseConfigured() && !!borrowerId,
  });
}

export function useCorporateEntities(borrowerId: string) {
  return useQuery({
    queryKey: ["corporate_entities", borrowerId],
    queryFn: async (): Promise<DbCorporateEntity[]> => {
      if (!isSupabaseConfigured()) return [];
      const { data, error } = await supabase!
        .from("corporate_entities")
        .select("*")
        .eq("borrower_id", borrowerId);
      if (error) throw error;
      return data as DbCorporateEntity[];
    },
    enabled: isSupabaseConfigured() && !!borrowerId,
  });
}

export function useKYCRecords(borrowerId: string) {
  return useQuery({
    queryKey: ["kyc_records", borrowerId],
    queryFn: async (): Promise<DbKYCRecord[]> => {
      if (!isSupabaseConfigured()) return [];
      const { data, error } = await supabase!
        .from("kyc_records")
        .select("*")
        .eq("borrower_id", borrowerId);
      if (error) throw error;
      return data as DbKYCRecord[];
    },
    enabled: isSupabaseConfigured() && !!borrowerId,
  });
}

export function useCompletedProjects(borrowerId: string) {
  return useQuery({
    queryKey: ["completed_projects", borrowerId],
    queryFn: async (): Promise<DbCompletedProject[]> => {
      if (!isSupabaseConfigured()) return [];
      const { data, error } = await supabase!
        .from("completed_projects")
        .select("*")
        .eq("borrower_id", borrowerId)
        .order("year", { ascending: false });
      if (error) throw error;
      return data as DbCompletedProject[];
    },
    enabled: isSupabaseConfigured() && !!borrowerId,
  });
}

// ===== DUE DILIGENCE =====

export function useDueDiligenceItems(dealId: string) {
  return useQuery({
    queryKey: ["dd_items", dealId],
    queryFn: async (): Promise<DbDueDiligenceItem[]> => {
      if (!isSupabaseConfigured()) return [];
      const { data, error } = await supabase!
        .from("due_diligence_items")
        .select("*")
        .eq("deal_id", dealId)
        .order("category");
      if (error) throw error;
      return data as DbDueDiligenceItem[];
    },
    enabled: isSupabaseConfigured() && !!dealId,
  });
}

export function useDDDocuments(ddItemId: string) {
  return useQuery({
    queryKey: ["dd_documents", ddItemId],
    queryFn: async (): Promise<DbDDDocument[]> => {
      if (!isSupabaseConfigured()) return [];
      const { data, error } = await supabase!
        .from("dd_documents")
        .select("*")
        .eq("dd_item_id", ddItemId);
      if (error) throw error;
      return data as DbDDDocument[];
    },
    enabled: isSupabaseConfigured() && !!ddItemId,
  });
}

export function useUpdateDDItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DbDueDiligenceItem> & { id: string }) => {
      if (!isSupabaseConfigured()) throw new Error("Supabase not configured");
      const { data, error } = await supabase!
        .from("due_diligence_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["dd_items", (data as DbDueDiligenceItem).deal_id] });
    },
  });
}

// ===== APPROVALS =====

export function useApprovalRecord(dealId: string) {
  return useQuery({
    queryKey: ["approvals", dealId],
    queryFn: async (): Promise<DbApprovalRecord | null> => {
      if (!isSupabaseConfigured()) return null;
      const { data, error } = await supabase!
        .from("approval_records")
        .select("*")
        .eq("deal_id", dealId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as DbApprovalRecord | null;
    },
    enabled: isSupabaseConfigured() && !!dealId,
  });
}

export function useICVotes(approvalId: string) {
  return useQuery({
    queryKey: ["ic_votes", approvalId],
    queryFn: async (): Promise<DbICVote[]> => {
      if (!isSupabaseConfigured()) return [];
      const { data, error } = await supabase!
        .from("ic_votes")
        .select("*")
        .eq("approval_id", approvalId);
      if (error) throw error;
      return data as DbICVote[];
    },
    enabled: isSupabaseConfigured() && !!approvalId,
  });
}

// ===== LEGAL & SECURITY =====

export function useLegalDocuments(dealId: string) {
  return useQuery({
    queryKey: ["legal_docs", dealId],
    queryFn: async (): Promise<DbLegalDocument[]> => {
      if (!isSupabaseConfigured()) return [];
      const { data, error } = await supabase!
        .from("legal_documents")
        .select("*")
        .eq("deal_id", dealId);
      if (error) throw error;
      return data as DbLegalDocument[];
    },
    enabled: isSupabaseConfigured() && !!dealId,
  });
}

export function useConditionsPrecedent(dealId: string) {
  return useQuery({
    queryKey: ["conditions_precedent", dealId],
    queryFn: async (): Promise<DbConditionPrecedent[]> => {
      if (!isSupabaseConfigured()) return [];
      const { data, error } = await supabase!
        .from("conditions_precedent")
        .select("*")
        .eq("deal_id", dealId);
      if (error) throw error;
      return data as DbConditionPrecedent[];
    },
    enabled: isSupabaseConfigured() && !!dealId,
  });
}

export function useSecurityItems(dealId: string) {
  return useQuery({
    queryKey: ["security_items", dealId],
    queryFn: async (): Promise<DbSecurityItem[]> => {
      if (!isSupabaseConfigured()) return [];
      const { data, error } = await supabase!
        .from("security_items")
        .select("*")
        .eq("deal_id", dealId);
      if (error) throw error;
      return data as DbSecurityItem[];
    },
    enabled: isSupabaseConfigured() && !!dealId,
  });
}

// ===== TERM SHEETS & WAIVERS =====

export function useTermSheet(dealId: string) {
  return useQuery({
    queryKey: ["term_sheets", dealId],
    queryFn: async (): Promise<DbTermSheet | null> => {
      if (!isSupabaseConfigured()) return null;
      const { data, error } = await supabase!
        .from("term_sheets")
        .select("*")
        .eq("deal_id", dealId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as DbTermSheet | null;
    },
    enabled: isSupabaseConfigured() && !!dealId,
  });
}

export function useTermSheetVersions(termSheetId: string) {
  return useQuery({
    queryKey: ["term_sheet_versions", termSheetId],
    queryFn: async (): Promise<DbTermSheetVersion[]> => {
      if (!isSupabaseConfigured()) return [];
      const { data, error } = await supabase!
        .from("term_sheet_versions")
        .select("*")
        .eq("term_sheet_id", termSheetId)
        .order("version");
      if (error) throw error;
      return data as DbTermSheetVersion[];
    },
    enabled: isSupabaseConfigured() && !!termSheetId,
  });
}

export function useWaivers(dealId: string) {
  return useQuery({
    queryKey: ["waivers", dealId],
    queryFn: async (): Promise<DbWaiver[]> => {
      if (!isSupabaseConfigured()) return [];
      const { data, error } = await supabase!
        .from("waivers")
        .select("*")
        .eq("deal_id", dealId);
      if (error) throw error;
      return data as DbWaiver[];
    },
    enabled: isSupabaseConfigured() && !!dealId,
  });
}

// ===== CONSTRUCTION MONITORING =====

export function useSiteVisits(dealId: string) {
  return useQuery({
    queryKey: ["site_visits", dealId],
    queryFn: async (): Promise<DbSiteVisit[]> => {
      if (!isSupabaseConfigured()) return [];
      const { data, error } = await supabase!
        .from("site_visits")
        .select("*")
        .eq("deal_id", dealId)
        .order("date", { ascending: false });
      if (error) throw error;
      return data as DbSiteVisit[];
    },
    enabled: isSupabaseConfigured() && !!dealId,
  });
}

export function useConstructionCertifications(dealId: string) {
  return useQuery({
    queryKey: ["certifications", dealId],
    queryFn: async (): Promise<DbConstructionCertification[]> => {
      if (!isSupabaseConfigured()) return [];
      const { data, error } = await supabase!
        .from("construction_certifications")
        .select("*")
        .eq("deal_id", dealId)
        .order("cert_number");
      if (error) throw error;
      return data as DbConstructionCertification[];
    },
    enabled: isSupabaseConfigured() && !!dealId,
  });
}

export function useMonitoringReports(dealId: string) {
  return useQuery({
    queryKey: ["monitoring_reports", dealId],
    queryFn: async (): Promise<DbMonitoringReport[]> => {
      if (!isSupabaseConfigured()) return [];
      const { data, error } = await supabase!
        .from("monitoring_reports")
        .select("*")
        .eq("deal_id", dealId)
        .order("report_number", { ascending: false });
      if (error) throw error;
      return data as DbMonitoringReport[];
    },
    enabled: isSupabaseConfigured() && !!dealId,
  });
}

// ===== AUDIT LOG =====

export function useAuditLogs(entityType?: string, entityId?: string) {
  return useQuery({
    queryKey: ["audit_logs", entityType, entityId],
    queryFn: async (): Promise<DbAuditLog[]> => {
      if (!isSupabaseConfigured()) return [];
      let query = supabase!
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (entityType) query = query.eq("entity_type", entityType);
      if (entityId) query = query.eq("entity_id", entityId);

      const { data, error } = await query;
      if (error) throw error;
      return data as DbAuditLog[];
    },
    enabled: isSupabaseConfigured(),
  });
}

// ===== GENERIC MUTATIONS FOR SUB-ENTITIES =====

export function useCreateDrawdown() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (drawdown: Omit<DbDrawdown, "id" | "created_at">) => {
      if (!isSupabaseConfigured()) throw new Error("Supabase not configured");
      const { data, error } = await supabase!.from("drawdowns").insert(drawdown).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["drawdowns", (data as DbDrawdown).deal_id] });
    },
  });
}

export function useCreateCovenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (covenant: Omit<DbCovenant, "id" | "created_at" | "updated_at">) => {
      if (!isSupabaseConfigured()) throw new Error("Supabase not configured");
      const { data, error } = await supabase!.from("covenants").insert(covenant).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["covenants", (data as DbCovenant).deal_id] });
    },
  });
}

export function useUpdateDrawdown() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DbDrawdown> & { id: string }) => {
      if (!isSupabaseConfigured()) throw new Error("Supabase not configured");
      const { data, error } = await supabase!.from("drawdowns").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["drawdowns", (data as DbDrawdown).deal_id] });
    },
  });
}

// ===== FILE STORAGE =====

export function useUploadDocument() {
  return useMutation({
    mutationFn: async ({ bucket, path, file }: { bucket: string; path: string; file: File }) => {
      if (!isSupabaseConfigured()) throw new Error("Supabase not configured");
      const { data, error } = await supabase!.storage.from(bucket).upload(path, file);
      if (error) throw error;
      return data;
    },
  });
}

export function useGetDocumentUrl() {
  return (bucket: string, path: string) => {
    if (!isSupabaseConfigured()) return "";
    const { data } = supabase!.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };
}

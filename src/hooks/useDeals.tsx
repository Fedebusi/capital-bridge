import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { sampleDeals, type Deal } from "@/data/sampleDeals";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useDealsQuery, useCreateDeal, useUpdateDeal, useDeleteDeal } from "@/hooks/useSupabaseQuery";
import type { DbDeal } from "@/types/database";

// Convert DB deal to frontend Deal type
function dbDealToFrontend(d: DbDeal): Deal {
  return {
    id: d.id,
    projectName: d.project_name,
    borrower: d.borrower_name,
    sponsor: d.sponsor,
    location: d.location,
    city: d.city,
    coordinates: d.coordinates as [number, number],
    stage: d.stage,
    assetType: d.asset_type,
    description: d.description,
    loanAmount: Number(d.loan_amount),
    currency: d.currency,
    interestRate: Number(d.interest_rate),
    pikSpread: Number(d.pik_spread),
    totalRate: Number(d.total_rate),
    originationFee: Number(d.origination_fee),
    exitFee: Number(d.exit_fee),
    tenor: d.tenor,
    maturityDate: d.maturity_date ?? "",
    disbursedAmount: Number(d.disbursed_amount),
    outstandingPrincipal: Number(d.outstanding_principal),
    accruedPIK: Number(d.accrued_pik),
    totalExposure: Number(d.total_exposure),
    gdv: Number(d.gdv),
    currentAppraisal: Number(d.current_appraisal),
    totalUnits: d.total_units,
    totalArea: Number(d.total_area),
    constructionBudget: Number(d.construction_budget),
    constructionSpent: Number(d.construction_spent),
    constructionProgress: d.construction_progress,
    landCost: Number(d.land_cost),
    ltv: Number(d.ltv),
    ltc: Number(d.ltc),
    preSalesPercent: Number(d.pre_sales_percent),
    developerExperience: d.developer_experience,
    developerTrackRecord: d.developer_track_record,
    dateReceived: d.date_received,
    termSheetDate: d.term_sheet_date ?? undefined,
    icApprovalDate: d.ic_approval_date ?? undefined,
    closingDate: d.closing_date ?? undefined,
    firstDrawdownDate: d.first_drawdown_date ?? undefined,
    expectedMaturity: d.expected_maturity ?? "",
    screeningScore: d.screening_score ?? undefined,
    drawdowns: [],
    covenants: [],
    unitSales: [],
    tags: d.tags ?? [],
  };
}

interface DealsContextType {
  deals: Deal[];
  loading: boolean;
  addDeals: (newDeals: Deal[]) => void;
  removeDeal: (id: string) => void;
  updateDealInContext: (id: string, updates: Partial<Deal>) => void;
  isLive: boolean;
}

const DealsContext = createContext<DealsContextType | null>(null);

export function DealsProvider({ children }: { children: ReactNode }) {
  const [localDeals, setLocalDeals] = useState<Deal[]>(sampleDeals);
  const isLive = isSupabaseConfigured();

  // Supabase query (only runs when configured)
  const { data: dbDeals, isLoading } = useDealsQuery();

  // Convert DB deals to frontend format when they arrive
  const [liveDeals, setLiveDeals] = useState<Deal[]>([]);
  useEffect(() => {
    if (dbDeals && dbDeals.length > 0) {
      setLiveDeals(dbDeals.map(dbDealToFrontend));
    }
  }, [dbDeals]);

  const deals = isLive ? liveDeals : localDeals;
  const loading = isLive ? isLoading : false;

  const addDeals = (newDeals: Deal[]) => {
    if (isLive) {
      // In live mode, new deals should be created via useCreateDeal mutation
      // This is for Excel import compatibility — adds to local state too
      setLiveDeals(prev => [...prev, ...newDeals]);
    } else {
      setLocalDeals(prev => [...prev, ...newDeals]);
    }
  };

  const removeDeal = (id: string) => {
    if (isLive) {
      setLiveDeals(prev => prev.filter(d => d.id !== id));
    } else {
      setLocalDeals(prev => prev.filter(d => d.id !== id));
    }
  };

  const updateDealInContext = (id: string, updates: Partial<Deal>) => {
    const updater = (prev: Deal[]) =>
      prev.map(d => (d.id === id ? { ...d, ...updates } : d));
    if (isLive) {
      setLiveDeals(updater);
    } else {
      setLocalDeals(updater);
    }
  };

  return (
    <DealsContext.Provider value={{ deals, loading, addDeals, removeDeal, updateDealInContext, isLive }}>
      {children}
    </DealsContext.Provider>
  );
}

export function useDeals() {
  const ctx = useContext(DealsContext);
  if (!ctx) throw new Error("useDeals must be used within DealsProvider");
  return ctx;
}

// Map from the deal-level 7-value `DealStage` enum to the corresponding
// lifecycle phase (1-12). Mirrors the mapping used in
// `supabase/migrations/00007_lifecycle_seed.sql`:
//
//   screening      -> origination (1)
//   due_diligence  -> due_diligence (3)
//   ic_approval    -> ic_approval (4)
//   documentation  -> legal_documentation (5)
//   active         -> drawdown_construction (7)
//   repaid         -> repayment (11)
//   rejected       -> null (no progress on the journey)

import type { DealStage } from "@/data/sampleDeals";
import type { PhaseId } from "@/data/lifecyclePhases";
import { phaseDefinitions } from "@/data/lifecyclePhases";

export const stageToPhaseId: Record<DealStage, PhaseId | null> = {
  screening: "origination",
  due_diligence: "due_diligence",
  ic_approval: "ic_approval",
  documentation: "legal_documentation",
  active: "drawdown_construction",
  repaid: "repayment",
  rejected: null,
};

export function stageToPhaseNumber(stage: DealStage): number | null {
  const phaseId = stageToPhaseId[stage];
  if (!phaseId) return null;
  const phase = phaseDefinitions.find((p) => p.id === phaseId);
  return phase?.number ?? null;
}

// Short, English UI labels for the 12 phases. The authoritative (Spanish)
// names live in `phaseDefinitions`; these are for the compact journey rail.
export const phaseShortLabels: Record<PhaseId, string> = {
  origination: "Origination",
  term_sheet: "Term Sheet",
  due_diligence: "Due Diligence",
  ic_approval: "IC Approval",
  legal_documentation: "Legal Docs",
  conditions_precedent: "CPs & First Drawdown",
  drawdown_construction: "Construction",
  monitoring_reporting: "Monitoring",
  commercialization: "Commercialization",
  completion_handover: "Completion",
  repayment: "Repayment",
  close_out: "Close-out",
};

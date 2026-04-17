import { describe, it, expect } from "vitest";
import {
  dbPhaseSubstepToFrontend,
  dbPhaseMilestoneToFrontend,
  dbLifecyclePhaseToFrontend,
  dbLifecycleToFrontend,
} from "@/lib/dbConverters";
import type {
  DbDealLifecycle,
  DbLifecyclePhase,
  DbPhaseSubstep,
  DbPhaseMilestone,
} from "@/types/database";

const agents = [
  { name: "Equipo de Originación", role: "Deal sourcing & screening", organization: "internal" as const },
  { name: "Promotor", role: "Project presentation", organization: "borrower" as const },
];

function makePhase(overrides: Partial<DbLifecyclePhase> = {}): DbLifecyclePhase {
  return {
    id: "phase-row-1",
    lifecycle_id: "lc-1",
    phase_id: "origination",
    number: 1,
    name: "Originación y Sourcing",
    description: "Identificación de oportunidades.",
    status: "completed",
    start_date: "2025-04-10",
    completed_date: "2025-04-18",
    estimated_duration: "1-2 weeks",
    depends_on: [],
    notes: null,
    agents,
    created_at: "",
    updated_at: "",
    ...overrides,
  };
}

describe("lifecycle converters", () => {
  describe("dbPhaseSubstepToFrontend", () => {
    it("maps all fields and converts nulls to undefined", () => {
      const row: DbPhaseSubstep = {
        id: "sub-1",
        phase_id: "phase-row-1",
        label: "Initial screening",
        description: "LTV/LTC check",
        status: "completed",
        completed_date: "2025-04-12",
        assignee: "A. Delgado",
        notes: null,
        created_at: "",
      };
      expect(dbPhaseSubstepToFrontend(row)).toEqual({
        id: "sub-1",
        label: "Initial screening",
        description: "LTV/LTC check",
        status: "completed",
        completedDate: "2025-04-12",
        assignee: "A. Delgado",
        notes: undefined,
      });
    });

    it("handles a blocked substep with notes", () => {
      const row: DbPhaseSubstep = {
        id: "sub-2",
        phase_id: "phase-row-1",
        label: "FY2025 audited accounts",
        description: "Missing",
        status: "blocked",
        completed_date: null,
        assignee: "X. Franco",
        notes: "Awaiting borrower delivery",
        created_at: "",
      };
      const result = dbPhaseSubstepToFrontend(row);
      expect(result.status).toBe("blocked");
      expect(result.notes).toBe("Awaiting borrower delivery");
      expect(result.completedDate).toBeUndefined();
    });
  });

  describe("dbPhaseMilestoneToFrontend", () => {
    it("maps achieved milestone with evidence", () => {
      const row: DbPhaseMilestone = {
        id: "m-1",
        phase_id: "phase-row-1",
        description: "IOI issued",
        achieved: true,
        achieved_date: "2025-04-15",
        evidence: "IOI letter sent",
        created_at: "",
      };
      expect(dbPhaseMilestoneToFrontend(row)).toEqual({
        description: "IOI issued",
        achieved: true,
        achievedDate: "2025-04-15",
        evidence: "IOI letter sent",
      });
    });

    it("maps pending milestone with null date/evidence", () => {
      const row: DbPhaseMilestone = {
        id: "m-2",
        phase_id: "phase-row-1",
        description: "Final de obra",
        achieved: false,
        achieved_date: null,
        evidence: null,
        created_at: "",
      };
      const result = dbPhaseMilestoneToFrontend(row);
      expect(result.achieved).toBe(false);
      expect(result.achievedDate).toBeUndefined();
      expect(result.evidence).toBeUndefined();
    });
  });

  describe("dbLifecyclePhaseToFrontend", () => {
    it("converts a complete phase with substeps and milestones", () => {
      const row = makePhase();
      const substeps: DbPhaseSubstep[] = [
        {
          id: "s-1", phase_id: row.id, label: "Teaser received", description: "IM received",
          status: "completed", completed_date: "2025-04-10", assignee: "M. Rivera", notes: null, created_at: "",
        },
      ];
      const milestones: DbPhaseMilestone[] = [
        {
          id: "m-1", phase_id: row.id, description: "IOI issued",
          achieved: true, achieved_date: "2025-04-15", evidence: null, created_at: "",
        },
      ];
      const result = dbLifecyclePhaseToFrontend(row, substeps, milestones);
      expect(result.id).toBe("origination");
      expect(result.number).toBe(1);
      expect(result.status).toBe("completed");
      expect(result.startDate).toBe("2025-04-10");
      expect(result.completedDate).toBe("2025-04-18");
      expect(result.estimatedDuration).toBe("1-2 weeks");
      expect(result.substeps).toHaveLength(1);
      expect(result.substeps[0].label).toBe("Teaser received");
      expect(result.milestones).toHaveLength(1);
      expect(result.milestones[0].description).toBe("IOI issued");
    });

    it("preserves agents jsonb array verbatim", () => {
      const row = makePhase();
      const result = dbLifecyclePhaseToFrontend(row);
      expect(result.agents).toEqual(agents);
      expect(result.agents[0].organization).toBe("internal");
      expect(result.agents[1].organization).toBe("borrower");
    });

    it("handles missing substeps and milestones as empty arrays", () => {
      const row = makePhase({ status: "not_started", start_date: null, completed_date: null });
      const result = dbLifecyclePhaseToFrontend(row);
      expect(result.substeps).toEqual([]);
      expect(result.milestones).toEqual([]);
      expect(result.startDate).toBeUndefined();
      expect(result.completedDate).toBeUndefined();
    });

    it("maps all phase_status enum values", () => {
      const statuses: DbLifecyclePhase["status"][] = [
        "not_started", "in_progress", "completed", "blocked", "skipped",
      ];
      for (const status of statuses) {
        const result = dbLifecyclePhaseToFrontend(makePhase({ status }));
        expect(result.status).toBe(status);
      }
    });

    it("preserves depends_on array", () => {
      const row = makePhase({
        phase_id: "term_sheet",
        depends_on: ["origination"],
      });
      const result = dbLifecyclePhaseToFrontend(row);
      expect(result.dependsOn).toEqual(["origination"]);
    });

    it("handles empty agents array when null-like", () => {
      const row = makePhase({ agents: [] });
      const result = dbLifecyclePhaseToFrontend(row);
      expect(result.agents).toEqual([]);
    });
  });

  describe("dbLifecycleToFrontend", () => {
    const lifecycle: DbDealLifecycle = {
      id: "lc-1",
      deal_id: "deal-001",
      current_phase: "due_diligence",
      created_at: "",
      updated_at: "",
    };

    it("assembles lifecycle from phases plus substep/milestone maps", () => {
      const phases: DbLifecyclePhase[] = [
        makePhase({ id: "p-1", phase_id: "origination", number: 1, name: "Origination" }),
        makePhase({ id: "p-2", phase_id: "term_sheet", number: 2, name: "Term Sheet", status: "in_progress" }),
      ];
      const substepsByPhase: Record<string, DbPhaseSubstep[]> = {
        "p-1": [
          { id: "s1", phase_id: "p-1", label: "Screen", description: "", status: "completed", completed_date: "2025-04-12", assignee: null, notes: null, created_at: "" },
        ],
      };
      const milestonesByPhase: Record<string, DbPhaseMilestone[]> = {
        "p-2": [
          { id: "m1", phase_id: "p-2", description: "TS signed", achieved: false, achieved_date: null, evidence: null, created_at: "" },
        ],
      };
      const result = dbLifecycleToFrontend(lifecycle, phases, substepsByPhase, milestonesByPhase);

      expect(result.dealId).toBe("deal-001");
      expect(result.currentPhase).toBe("due_diligence");
      expect(result.phases).toHaveLength(2);
      expect(result.phases[0].id).toBe("origination");
      expect(result.phases[0].substeps).toHaveLength(1);
      expect(result.phases[1].id).toBe("term_sheet");
      expect(result.phases[1].milestones).toHaveLength(1);
      expect(result.phases[1].substeps).toEqual([]);
      expect(result.phases[0].milestones).toEqual([]);
    });

    it("sorts phases by number even when supplied out of order", () => {
      const phases: DbLifecyclePhase[] = [
        makePhase({ id: "p-3", phase_id: "due_diligence", number: 3, name: "DD" }),
        makePhase({ id: "p-1", phase_id: "origination", number: 1, name: "Origination" }),
        makePhase({ id: "p-2", phase_id: "term_sheet", number: 2, name: "TS" }),
      ];
      const result = dbLifecycleToFrontend(lifecycle, phases);
      expect(result.phases.map((p) => p.number)).toEqual([1, 2, 3]);
    });

    it("handles empty phases and missing maps", () => {
      const result = dbLifecycleToFrontend(lifecycle, []);
      expect(result.phases).toEqual([]);
      expect(result.dealId).toBe("deal-001");
    });
  });
});

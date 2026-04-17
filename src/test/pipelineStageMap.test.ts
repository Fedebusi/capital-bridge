import { describe, it, expect } from "vitest";
import {
  stageToPhaseId,
  stageToPhaseNumber,
  phaseShortLabels,
} from "@/components/pipeline/pipelineStageMap";
import { phaseDefinitions, type PhaseId } from "@/data/lifecyclePhases";

describe("pipelineStageMap", () => {
  it("maps every DealStage to the matching lifecycle phase (mirrors 00007 seed)", () => {
    expect(stageToPhaseId.screening).toBe("origination");
    expect(stageToPhaseId.due_diligence).toBe("due_diligence");
    expect(stageToPhaseId.ic_approval).toBe("ic_approval");
    expect(stageToPhaseId.documentation).toBe("legal_documentation");
    expect(stageToPhaseId.active).toBe("drawdown_construction");
    expect(stageToPhaseId.repaid).toBe("repayment");
    expect(stageToPhaseId.rejected).toBeNull();
  });

  it("resolves phase numbers that match phaseDefinitions", () => {
    expect(stageToPhaseNumber("screening")).toBe(1);
    expect(stageToPhaseNumber("due_diligence")).toBe(3);
    expect(stageToPhaseNumber("ic_approval")).toBe(4);
    expect(stageToPhaseNumber("documentation")).toBe(5);
    expect(stageToPhaseNumber("active")).toBe(7);
    expect(stageToPhaseNumber("repaid")).toBe(11);
    expect(stageToPhaseNumber("rejected")).toBeNull();
  });

  it("provides a short label for every phase id", () => {
    const ids = phaseDefinitions.map((p) => p.id) as PhaseId[];
    for (const id of ids) {
      expect(phaseShortLabels[id]).toBeTruthy();
      expect(typeof phaseShortLabels[id]).toBe("string");
    }
  });
});

import { describe, it, expect } from "vitest";
import { computeCovenantStatus, parseThreshold, recomputeCovenants } from "@/lib/covenants";
import type { Covenant } from "@/data/sampleDeals";

function cov(threshold: string, currentValue: string): Covenant {
  return { name: "Test", metric: "Test", threshold, currentValue, status: "compliant" };
}

describe("parseThreshold", () => {
  it("parses ≤ percentage thresholds", () => {
    expect(parseThreshold("≤ 65%")).toEqual({ operator: "<=", value: 65 });
  });
  it("parses ≥ percentage thresholds", () => {
    expect(parseThreshold("≥ 30%")).toEqual({ operator: ">=", value: 30 });
  });
  it("parses strict < and >", () => {
    expect(parseThreshold("< 1.2")).toEqual({ operator: "<", value: 1.2 });
    expect(parseThreshold("> 5")).toEqual({ operator: ">", value: 5 });
  });
  it("defaults to <= when no operator", () => {
    expect(parseThreshold("65%")).toEqual({ operator: "<=", value: 65 });
  });
  it("returns null for garbage", () => {
    expect(parseThreshold("")).toBeNull();
    expect(parseThreshold("none")).toBeNull();
  });
});

describe("computeCovenantStatus", () => {
  it("compliant when current is well below a ≤ threshold", () => {
    expect(computeCovenantStatus(cov("≤ 65%", "52.4%"))).toBe("compliant");
  });

  it("watch when current is within warning band of a ≤ threshold", () => {
    // default margin 5% of 65 = 3.25 band, so 63% should flag watch
    expect(computeCovenantStatus(cov("≤ 65%", "63%"))).toBe("watch");
  });

  it("breach when current exceeds a ≤ threshold", () => {
    expect(computeCovenantStatus(cov("≤ 65%", "72.8%"))).toBe("breach");
  });

  it("breach when current is below a ≥ threshold", () => {
    expect(computeCovenantStatus(cov("≥ 30%", "18%"))).toBe("breach");
  });

  it("compliant when current far exceeds ≥ threshold", () => {
    expect(computeCovenantStatus(cov("≥ 30%", "47%"))).toBe("compliant");
  });

  it("watch when current is just above ≥ threshold", () => {
    // 30 + 5% margin = 1.5 band, so 31% = watch
    expect(computeCovenantStatus(cov("≥ 30%", "31%"))).toBe("watch");
  });

  it("falls back to stored status when values are unparseable", () => {
    const c: Covenant = { name: "x", metric: "x", threshold: "N/A", currentValue: "unknown", status: "watch" };
    expect(computeCovenantStatus(c)).toBe("watch");
  });

  it("handles currency formats", () => {
    expect(computeCovenantStatus(cov("≥ €1,000,000", "€1,200,000"))).toBe("compliant");
    expect(computeCovenantStatus(cov("≥ €1,000,000", "€800,000"))).toBe("breach");
  });

  it("recomputes an entire list", () => {
    const list: Covenant[] = [
      { ...cov("≤ 65%", "72%"), status: "compliant" }, // wrong, should flip to breach
      { ...cov("≥ 30%", "45%"), status: "breach" },    // wrong, should flip to compliant
    ];
    const out = recomputeCovenants(list);
    expect(out[0].status).toBe("breach");
    expect(out[1].status).toBe("compliant");
  });
});

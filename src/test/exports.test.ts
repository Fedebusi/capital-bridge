import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as XLSX from "xlsx";
import {
  buildWorkbook,
  sanitizeSheetName,
  stampedFilename,
} from "@/lib/exports/exportToExcel";
import { buildCsv, downloadCsv, exportToCsv } from "@/lib/exports/exportToCsv";
import {
  buildDealTemplateSheets,
  buildBorrowerTemplateSheets,
  DEAL_TEMPLATE_COLUMNS,
  BORROWER_TEMPLATE_COLUMNS,
} from "@/lib/exports/dealTemplate";

describe("buildWorkbook", () => {
  it("creates one worksheet per sheet definition", () => {
    const wb = buildWorkbook([
      { name: "A", rows: [{ id: 1, name: "foo" }] },
      { name: "B", rows: [{ id: 2, name: "bar" }] },
    ]);
    expect(wb.SheetNames).toEqual(["A", "B"]);
  });

  it("derives headers from the first row's keys", () => {
    const wb = buildWorkbook([{ name: "S", rows: [{ Project: "X", Amount: 100 }] }]);
    const ws = wb.Sheets["S"];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({ Project: "X", Amount: 100 });
  });

  it("preserves numbers as numbers, not strings", () => {
    const wb = buildWorkbook([{ name: "S", rows: [{ amount: 12345.67 }] }]);
    const ws = wb.Sheets["S"];
    const cell = ws["A2"];
    expect(cell.t).toBe("n");
    expect(cell.v).toBe(12345.67);
  });

  it("sets column widths based on content length", () => {
    const wb = buildWorkbook([
      { name: "S", rows: [{ Short: "ab", Longer: "A very long string here" }] },
    ]);
    const ws = wb.Sheets["S"];
    expect(ws["!cols"]).toBeDefined();
    const cols = ws["!cols"] as { wch: number }[];
    expect(cols).toHaveLength(2);
    // second column should be wider than first
    expect(cols[1].wch).toBeGreaterThan(cols[0].wch);
  });

  it("falls back to a placeholder sheet when no sheets are supplied", () => {
    const wb = buildWorkbook([]);
    expect(wb.SheetNames).toHaveLength(1);
  });

  it("handles empty rows by emitting a single placeholder row", () => {
    const wb = buildWorkbook([{ name: "Empty", rows: [] }]);
    const ws = wb.Sheets["Empty"];
    expect(ws).toBeDefined();
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
    // Emits a single placeholder row so the sheet is still valid
    expect(rows).toHaveLength(1);
    expect(Object.keys(rows[0])).toContain("(no data)");
  });
});

describe("sanitizeSheetName", () => {
  it("strips Excel-forbidden characters", () => {
    expect(sanitizeSheetName("Foo/Bar:Baz?")).toBe("Foo-Bar-Baz-");
  });

  it("truncates names over 31 chars", () => {
    const long = "x".repeat(50);
    expect(sanitizeSheetName(long)).toHaveLength(31);
  });

  it("returns a fallback for empty input", () => {
    expect(sanitizeSheetName("")).toBe("Sheet");
  });
});

describe("stampedFilename", () => {
  it("includes today's ISO date", () => {
    const today = new Date().toISOString().split("T")[0];
    expect(stampedFilename("LoanBook")).toBe(`CapitalBridge_LoanBook_${today}`);
  });
});

describe("buildCsv", () => {
  it("returns empty string when no rows", () => {
    expect(buildCsv([])).toBe("");
  });

  it("writes header row derived from first row's keys", () => {
    const csv = buildCsv([{ Project: "Foo", Amount: 100 }]);
    const [header, row] = csv.split("\n");
    expect(header).toBe("Project,Amount");
    expect(row).toBe("Foo,100");
  });

  it("escapes values containing commas, quotes, or newlines", () => {
    const csv = buildCsv([{ Name: 'Foo, "Bar"', Notes: "line1\nline2" }]);
    const row = csv.split("\n").slice(1).join("\n");
    expect(row).toContain('"Foo, ""Bar"""');
    expect(row).toContain('"line1\nline2"');
  });

  it("handles null and undefined as empty strings", () => {
    const csv = buildCsv([{ A: null, B: undefined, C: 0 }]);
    const [, row] = csv.split("\n");
    expect(row).toBe(",,0");
  });

  it("writes one line per row", () => {
    const csv = buildCsv([
      { id: 1, name: "a" },
      { id: 2, name: "b" },
      { id: 3, name: "c" },
    ]);
    expect(csv.split("\n")).toHaveLength(4);
  });
});

describe("downloadCsv / exportToCsv", () => {
  let createObjectURLSpy: ReturnType<typeof vi.fn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.fn>;
  let clickSpy: ReturnType<typeof vi.fn>;
  let appendSpy: ReturnType<typeof vi.spyOn>;
  let removeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    createObjectURLSpy = vi.fn(() => "blob:fake");
    revokeObjectURLSpy = vi.fn();
    (globalThis.URL as unknown as { createObjectURL: typeof createObjectURLSpy }).createObjectURL = createObjectURLSpy;
    (globalThis.URL as unknown as { revokeObjectURL: typeof revokeObjectURLSpy }).revokeObjectURL = revokeObjectURLSpy;

    clickSpy = vi.fn();
    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = origCreate(tag) as HTMLElement;
      if (tag === "a") {
        (el as HTMLAnchorElement).click = clickSpy;
      }
      return el;
    });
    appendSpy = vi.spyOn(document.body, "appendChild").mockImplementation((node) => node as never);
    removeSpy = vi.spyOn(document.body, "removeChild").mockImplementation((node) => node as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("triggers a download with an .csv-suffixed filename", () => {
    downloadCsv("positions", "header\nrow1");
    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLSpy).toHaveBeenCalledTimes(1);
    expect(appendSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledTimes(1);
  });

  it("respects an already-suffixed filename", () => {
    downloadCsv("positions.csv", "header\nrow1");
    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
  });

  it("exportToCsv builds rows and triggers download end-to-end", () => {
    exportToCsv("deals", [{ id: 1, name: "Foo" }]);
    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });
});

describe("buildDealTemplateSheets", () => {
  it("has a New Deals sheet + Instructions sheet", () => {
    const sheets = buildDealTemplateSheets();
    expect(sheets.map((s) => s.name)).toEqual(["New Deals", "Instructions"]);
  });

  it("includes 2 example rows in the New Deals sheet", () => {
    const [dealsSheet] = buildDealTemplateSheets();
    expect(dealsSheet.rows).toHaveLength(2);
  });

  it("deal rows use the exact set of canonical headers", () => {
    const [dealsSheet] = buildDealTemplateSheets();
    const row0Keys = Object.keys(dealsSheet.rows[0]);
    expect(row0Keys).toEqual(DEAL_TEMPLATE_COLUMNS.map((c) => c.header));
  });

  it("required columns appear in the template", () => {
    const [dealsSheet] = buildDealTemplateSheets();
    const headers = Object.keys(dealsSheet.rows[0]);
    expect(headers).toContain("Project Name");
    expect(headers).toContain("Borrower");
    expect(headers).toContain("Loan Amount (€)");
    expect(headers).toContain("Tenor (months)");
  });
});

describe("buildBorrowerTemplateSheets", () => {
  it("has a New Borrowers sheet + Instructions sheet", () => {
    const sheets = buildBorrowerTemplateSheets();
    expect(sheets.map((s) => s.name)).toEqual(["New Borrowers", "Instructions"]);
  });

  it("borrower example row uses the canonical headers", () => {
    const [sheet] = buildBorrowerTemplateSheets();
    const headers = Object.keys(sheet.rows[0]);
    expect(headers).toEqual(BORROWER_TEMPLATE_COLUMNS.map((c) => c.header));
  });
});

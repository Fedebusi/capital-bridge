import * as XLSX from "xlsx";

export interface SheetDefinition {
  /** Sheet tab name (max 31 chars per Excel spec) */
  name: string;
  /** Rows as plain objects — keys become column headers, preserving the order of the first row */
  rows: Record<string, unknown>[];
}

/**
 * Build a workbook in-memory from sheet definitions. Auto-sizes columns based on cell content.
 * Exposed separately so tests can inspect the structure without touching the filesystem.
 */
export function buildWorkbook(sheets: SheetDefinition[]): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  if (sheets.length === 0) {
    // Ensure the workbook is always valid — Excel requires at least one sheet
    const ws = XLSX.utils.aoa_to_sheet([["(empty)"]]);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    return wb;
  }

  sheets.forEach((sheet) => {
    const safeName = sanitizeSheetName(sheet.name);
    const rows = sheet.rows.length > 0 ? sheet.rows : [{ "(no data)": "" }];
    const headers = Object.keys(rows[0]);
    const ws = XLSX.utils.json_to_sheet(rows, { header: headers });

    // Auto-width: pick the max of header length / cell content across the column, capped
    ws["!cols"] = headers.map((h) => {
      const headerLen = h.length;
      const maxCellLen = rows.reduce((max, row) => {
        const v = row[h];
        const s = v === null || v === undefined ? "" : String(v);
        return Math.max(max, s.length);
      }, 0);
      return { wch: Math.min(60, Math.max(headerLen, maxCellLen, 10) + 2) };
    });

    XLSX.utils.book_append_sheet(wb, ws, safeName);
  });

  return wb;
}

/**
 * Write a workbook to the user's disk as an .xlsx file.
 * `filename` should NOT include the extension — it is appended automatically.
 */
export function exportToExcel(filename: string, sheets: SheetDefinition[]): void {
  const wb = buildWorkbook(sheets);
  const finalName = filename.toLowerCase().endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  XLSX.writeFile(wb, finalName);
}

/**
 * Excel limits sheet names to 31 chars and disallows: : \ / ? * [ ]
 */
export function sanitizeSheetName(name: string): string {
  return name.replace(/[:\\/?*[\]]/g, "-").slice(0, 31) || "Sheet";
}

/**
 * Convenience: stamp today's date (YYYY-MM-DD) onto a filename stem.
 */
export function stampedFilename(stem: string): string {
  const today = new Date().toISOString().split("T")[0];
  return `CapitalBridge_${stem}_${today}`;
}

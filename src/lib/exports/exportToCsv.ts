/**
 * Build a CSV string from an array of row objects. Keys of the first row become the header row.
 * Handles escaping for values containing commas, quotes, or newlines.
 */
export function buildCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "number" || typeof v === "boolean" ? String(v) : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => esc(row[h])).join(",")),
  ];
  return lines.join("\n");
}

/**
 * Trigger a browser download for the given CSV string.
 * Uses URL.createObjectURL + a programmatic anchor click — no runtime deps.
 */
export function downloadCsv(filename: string, csv: string): void {
  const finalName = filename.toLowerCase().endsWith(".csv") ? filename : `${filename}.csv`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = finalName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * One-shot helper: build + download a CSV from row objects.
 */
export function exportToCsv(filename: string, rows: Record<string, unknown>[]): void {
  downloadCsv(filename, buildCsv(rows));
}

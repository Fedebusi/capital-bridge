import type { Covenant, CovenantStatus } from "@/data/sampleDeals";

type Operator = "<=" | ">=" | "<" | ">" | "=";

// Parse a number out of strings like "52.4%", "€1,200,000", "1.25x", "30%".
// Returns null when no numeric portion is found.
function parseNumeric(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d.,-]/g, "").replace(/,/g, "");
  if (!cleaned || cleaned === "-" || cleaned === ".") return null;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

// Normalise Unicode comparison glyphs (≤ ≥) to ASCII equivalents.
function normaliseOperators(s: string): string {
  return s
    .replace(/≤/g, "<=")
    .replace(/≥/g, ">=")
    .replace(/≠/g, "!=");
}

interface ParsedThreshold {
  operator: Operator;
  value: number;
}

// Extracts (operator, value) from strings like "<= 65%", ">= 30%", "< 1.2".
// Defaults to "<=" when no operator is present (most covenant thresholds
// are written as maxima, e.g. "65% LTV").
export function parseThreshold(raw: string): ParsedThreshold | null {
  const s = normaliseOperators(raw).trim();
  if (!s) return null;

  let operator: Operator = "<=";
  let rest = s;
  const match = s.match(/^(<=|>=|<|>|=)\s*(.*)$/);
  if (match) {
    operator = match[1] as Operator;
    rest = match[2];
  }
  const value = parseNumeric(rest);
  if (value === null) return null;
  return { operator, value };
}

// Compute covenant status from its threshold and current value.
// `warningMargin` (0..1) – fractional proximity to threshold that triggers
// a "watch" state. Default 0.05 = within 5% of the threshold.
// Returns the covenant's own `status` if parsing fails (preserves legacy data).
export function computeCovenantStatus(
  covenant: Covenant,
  opts: { warningMargin?: number } = {},
): CovenantStatus {
  const parsed = parseThreshold(covenant.threshold);
  const current = parseNumeric(covenant.currentValue);
  if (!parsed || current === null) return covenant.status;

  const { operator, value: threshold } = parsed;
  const margin = opts.warningMargin ?? 0.05;
  const band = Math.abs(threshold) * margin;

  switch (operator) {
    case "<=":
      if (current > threshold) return "breach";
      if (threshold - current <= band) return "watch";
      return "compliant";
    case "<":
      if (current >= threshold) return "breach";
      if (threshold - current <= band) return "watch";
      return "compliant";
    case ">=":
      if (current < threshold) return "breach";
      if (current - threshold <= band) return "watch";
      return "compliant";
    case ">":
      if (current <= threshold) return "breach";
      if (current - threshold <= band) return "watch";
      return "compliant";
    case "=":
      if (Math.abs(current - threshold) <= band) return "compliant";
      return "breach";
    default:
      return covenant.status;
  }
}

// Return the covenant list with each covenant's status auto-recomputed.
// Pure function — used anywhere covenant status is displayed.
export function recomputeCovenants(
  covenants: Covenant[],
  opts?: { warningMargin?: number },
): Covenant[] {
  return covenants.map(c => ({ ...c, status: computeCovenantStatus(c, opts) }));
}

import { exportToExcel, type SheetDefinition } from "./exportToExcel";

export interface TemplateColumn {
  header: string;
  example1: string | number;
  example2: string | number;
  required: boolean;
}

export const DEAL_TEMPLATE_COLUMNS: TemplateColumn[] = [
  { header: "Project Name", example1: "Terrazas del Sol", example2: "Marina Residences", required: true },
  { header: "Borrower", example1: "Solaris Promociones SL", example2: "Marina Residences SL", required: true },
  { header: "Sponsor", example1: "Grupo Valverde Inversiones", example2: "Balear Real Estate", required: false },
  { header: "Location", example1: "Marbella, Málaga", example2: "Palma de Mallorca, Baleares", required: true },
  { header: "City", example1: "Marbella", example2: "Palma de Mallorca", required: true },
  { header: "Latitude", example1: 36.5099, example2: 39.5696, required: false },
  { header: "Longitude", example1: -4.8861, example2: 2.6502, required: false },
  { header: "Asset Type", example1: "Residential - Build to Sell", example2: "Residential - Refurbishment & Sale", required: true },
  { header: "Description", example1: "Luxury residential complex", example2: "Seafront apartments", required: false },
  { header: "Loan Amount (€)", example1: 14200000, example2: 22000000, required: true },
  { header: "Interest Rate (%)", example1: 5.5, example2: 5.0, required: true },
  { header: "PIK Spread (%)", example1: 3.5, example2: 4.0, required: false },
  { header: "Origination Fee (%)", example1: 1.5, example2: 1.5, required: false },
  { header: "Exit Fee (%)", example1: 1.0, example2: 1.0, required: false },
  { header: "Tenor (months)", example1: 24, example2: 30, required: true },
  { header: "GDV (€)", example1: 32000000, example2: 48000000, required: true },
  { header: "Total Units", example1: 38, example2: 52, required: false },
  { header: "Total Area (sqm)", example1: 4200, example2: 6500, required: false },
  { header: "Construction Budget (€)", example1: 18000000, example2: 28000000, required: false },
  { header: "Land Cost (€)", example1: 5000000, example2: 8000000, required: false },
  { header: "Pre-Sales (%)", example1: 25, example2: 15, required: false },
  { header: "Developer Experience", example1: "15+ years residential", example2: "10+ years coastal", required: false },
  { header: "Developer Track Record (projects)", example1: 12, example2: 8, required: false },
  { header: "Expected Maturity", example1: "Q4 2027", example2: "Q2 2028", required: false },
  { header: "Tags (comma separated)", example1: "luxury, sea-view", example2: "seafront, refurb", required: false },
];

/**
 * Build the canonical deal-import template as sheet definitions:
 * - "New Deals" — headers + 2 example rows the user can overwrite
 * - "Instructions" — field reference, required flag, accepted enums
 */
export function buildDealTemplateSheets(): SheetDefinition[] {
  const exampleRows = [
    Object.fromEntries(DEAL_TEMPLATE_COLUMNS.map((c) => [c.header, c.example1])),
    Object.fromEntries(DEAL_TEMPLATE_COLUMNS.map((c) => [c.header, c.example2])),
  ];

  const instructionsRows = [
    { Field: "— Instructions —", Required: "", Example: "Fill in the 'New Deals' sheet, delete the example rows, then re-upload." },
    ...DEAL_TEMPLATE_COLUMNS.map((c) => ({
      Field: c.header,
      Required: c.required ? "Yes" : "No",
      Example: String(c.example1),
    })),
    { Field: "— Accepted Asset Types —", Required: "", Example: "" },
    { Field: "Residential - Build to Sell", Required: "", Example: "" },
    { Field: "Residential - Refurbishment & Sale", Required: "", Example: "" },
    { Field: "Mixed Use", Required: "", Example: "" },
    { Field: "Commercial", Required: "", Example: "" },
    { Field: "Land Development", Required: "", Example: "" },
  ];

  return [
    { name: "New Deals", rows: exampleRows },
    { name: "Instructions", rows: instructionsRows },
  ];
}

/**
 * Download the deal-import Excel template.
 */
export function downloadDealTemplateXlsx(): void {
  exportToExcel("CapitalBridge_Deal_Template", buildDealTemplateSheets());
}

/**
 * Borrower template: lightweight scaffold for paste-and-import workflows.
 */
export interface BorrowerTemplateColumn {
  header: string;
  example: string | number;
  required: boolean;
}

export const BORROWER_TEMPLATE_COLUMNS: BorrowerTemplateColumn[] = [
  { header: "Borrower Name", example: "Solaris Promociones SL", required: true },
  { header: "Group", example: "Grupo Valverde", required: false },
  { header: "Type", example: "Developer", required: true },
  { header: "Internal Rating", example: "A", required: false },
  { header: "Headquarters", example: "Madrid, Spain", required: true },
  { header: "Year Established", example: 2008, required: false },
  { header: "Website", example: "https://example.com", required: false },
  { header: "Description", example: "Residential developer focused on Costa del Sol", required: false },
];

export function buildBorrowerTemplateSheets(): SheetDefinition[] {
  const exampleRow = Object.fromEntries(BORROWER_TEMPLATE_COLUMNS.map((c) => [c.header, c.example]));
  const instructionsRows = BORROWER_TEMPLATE_COLUMNS.map((c) => ({
    Field: c.header,
    Required: c.required ? "Yes" : "No",
    Example: String(c.example),
  }));
  return [
    { name: "New Borrowers", rows: [exampleRow] },
    { name: "Instructions", rows: instructionsRows },
  ];
}

export function downloadBorrowerTemplateXlsx(): void {
  exportToExcel("CapitalBridge_Borrower_Template", buildBorrowerTemplateSheets());
}

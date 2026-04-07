import * as XLSX from "xlsx";
import type { Deal, DealStage } from "@/data/sampleDeals";

// Column definitions for the template
const TEMPLATE_COLUMNS = [
  { header: "Project Name", key: "projectName", example: "Terrazas del Sol", required: true },
  { header: "Borrower", key: "borrower", example: "Solaris Promociones SL", required: true },
  { header: "Sponsor", key: "sponsor", example: "Grupo Valverde Inversiones", required: false },
  { header: "Location", key: "location", example: "Marbella, Málaga", required: true },
  { header: "City", key: "city", example: "Marbella", required: true },
  { header: "Latitude", key: "lat", example: "36.5099", required: false },
  { header: "Longitude", key: "lng", example: "-4.8861", required: false },
  { header: "Asset Type", key: "assetType", example: "Residential - Build to Sell", required: true },
  { header: "Description", key: "description", example: "Luxury residential complex...", required: false },
  { header: "Loan Amount (€)", key: "loanAmount", example: "14200000", required: true },
  { header: "Interest Rate (%)", key: "interestRate", example: "5.5", required: true },
  { header: "PIK Spread (%)", key: "pikSpread", example: "3.5", required: false },
  { header: "Origination Fee (%)", key: "originationFee", example: "1.5", required: false },
  { header: "Exit Fee (%)", key: "exitFee", example: "1.0", required: false },
  { header: "Tenor (months)", key: "tenor", example: "24", required: true },
  { header: "GDV (€)", key: "gdv", example: "32000000", required: true },
  { header: "Total Units", key: "totalUnits", example: "38", required: false },
  { header: "Total Area (sqm)", key: "totalArea", example: "4200", required: false },
  { header: "Construction Budget (€)", key: "constructionBudget", example: "18000000", required: false },
  { header: "Land Cost (€)", key: "landCost", example: "5000000", required: false },
  { header: "Pre-Sales (%)", key: "preSalesPercent", example: "25", required: false },
  { header: "Developer Experience", key: "developerExperience", example: "15+ years residential", required: false },
  { header: "Developer Track Record (projects)", key: "developerTrackRecord", example: "12", required: false },
  { header: "Expected Maturity", key: "expectedMaturity", example: "Q4 2027", required: false },
  { header: "Tags (comma separated)", key: "tags", example: "luxury, sea-view, golden-mile", required: false },
];

/**
 * Generate and download an Excel template for deal import
 */
export function downloadDealTemplate() {
  const wb = XLSX.utils.book_new();

  // Main data sheet with headers + example row
  const headers = TEMPLATE_COLUMNS.map(c => c.header);
  const exampleRow = TEMPLATE_COLUMNS.map(c => c.example);
  const wsData = [headers, exampleRow];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws["!cols"] = TEMPLATE_COLUMNS.map(c => ({ wch: Math.max(c.header.length, (c.example || "").length, 15) + 2 }));

  XLSX.utils.book_append_sheet(wb, ws, "New Deals");

  // Instructions sheet
  const instrData = [
    ["CapitalBridge - Deal Import Template"],
    [""],
    ["Instructions:"],
    ["1. Fill in the 'New Deals' sheet with your deal data (one deal per row)"],
    ["2. The first row (example) can be deleted or overwritten"],
    ["3. Required fields are marked with * below"],
    ["4. Monetary values should be in EUR without currency symbols"],
    ["5. Upload the file via the Import button in the Pipeline page"],
    [""],
    ["Field Reference:"],
    ...TEMPLATE_COLUMNS.map(c => [`  ${c.required ? "* " : "  "}${c.header} — e.g. ${c.example}`]),
    [""],
    ["Asset Types (accepted values):"],
    ["  Residential - Build to Sell"],
    ["  Residential - Refurbishment & Sale"],
    ["  Mixed Use"],
    ["  Commercial"],
    ["  Land Development"],
  ];
  const wsInstr = XLSX.utils.aoa_to_sheet(instrData);
  wsInstr["!cols"] = [{ wch: 70 }];
  XLSX.utils.book_append_sheet(wb, wsInstr, "Instructions");

  XLSX.writeFile(wb, "CapitalBridge_Deal_Template.xlsx");
}

/**
 * Parse an uploaded Excel file and return Deal objects
 */
export function parseDealsFromExcel(file: File): Promise<{ deals: Deal[]; errors: string[] }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: "array" });

      // Read first sheet
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(ws);

      const deals: Deal[] = [];
      const errors: string[] = [];

      rows.forEach((row, idx) => {
        const rowNum = idx + 2; // +2 because row 1 is header

        // Validate required fields
        const projectName = String(row["Project Name"] || "").trim();
        const borrower = String(row["Borrower"] || "").trim();
        const location = String(row["Location"] || "").trim();
        const city = String(row["City"] || "").trim();
        const loanAmount = Number(row["Loan Amount (€)"] || 0);
        const interestRate = Number(row["Interest Rate (%)"] || 0);
        const tenor = Number(row["Tenor (months)"] || 0);
        const gdv = Number(row["GDV (€)"] || 0);

        if (!projectName) { errors.push(`Row ${rowNum}: Project Name is required`); return; }
        if (!borrower) { errors.push(`Row ${rowNum}: Borrower is required`); return; }
        if (!loanAmount || loanAmount <= 0) { errors.push(`Row ${rowNum}: Valid Loan Amount is required`); return; }
        if (!interestRate) { errors.push(`Row ${rowNum}: Interest Rate is required`); return; }
        if (!tenor) { errors.push(`Row ${rowNum}: Tenor is required`); return; }
        if (!gdv || gdv <= 0) { errors.push(`Row ${rowNum}: Valid GDV is required`); return; }

        const pikSpread = Number(row["PIK Spread (%)"] || 0);
        const totalRate = interestRate + pikSpread;
        const constructionBudget = Number(row["Construction Budget (€)"] || 0);
        const landCost = Number(row["Land Cost (€)"] || 0);
        const totalCost = constructionBudget + landCost || gdv * 0.7;
        const ltv = gdv > 0 ? (loanAmount / gdv) * 100 : 0;
        const ltc = totalCost > 0 ? (loanAmount / totalCost) * 100 : 0;
        const lat = Number(row["Latitude"] || 40.0);
        const lng = Number(row["Longitude"] || -3.7);
        const tagsStr = String(row["Tags (comma separated)"] || "");
        const tags = tagsStr ? tagsStr.split(",").map(t => t.trim()).filter(Boolean) : [];

        const deal: Deal = {
          id: `deal-import-${Date.now()}-${idx}`,
          projectName,
          borrower,
          sponsor: String(row["Sponsor"] || borrower),
          location: location || city,
          city: city || location.split(",")[0]?.trim() || "",
          coordinates: [lat, lng],
          stage: "screening" as DealStage,
          assetType: String(row["Asset Type"] || "Residential - Build to Sell"),
          description: String(row["Description"] || `${projectName} — imported deal`),
          loanAmount,
          currency: "EUR",
          interestRate,
          pikSpread,
          totalRate,
          originationFee: Number(row["Origination Fee (%)"] || 1.5),
          exitFee: Number(row["Exit Fee (%)"] || 1.0),
          tenor,
          maturityDate: "",
          disbursedAmount: 0,
          outstandingPrincipal: 0,
          accruedPIK: 0,
          totalExposure: loanAmount,
          gdv,
          currentAppraisal: gdv * 0.9,
          totalUnits: Number(row["Total Units"] || 0),
          totalArea: Number(row["Total Area (sqm)"] || 0),
          constructionBudget,
          constructionSpent: 0,
          constructionProgress: 0,
          landCost,
          ltv: Math.round(ltv * 10) / 10,
          ltc: Math.round(ltc * 10) / 10,
          preSalesPercent: Number(row["Pre-Sales (%)"] || 0),
          developerExperience: String(row["Developer Experience"] || ""),
          developerTrackRecord: Number(row["Developer Track Record (projects)"] || 0),
          dateReceived: new Date().toISOString().split("T")[0],
          expectedMaturity: String(row["Expected Maturity"] || ""),
          drawdowns: [],
          covenants: [],
          unitSales: [],
          tags,
        };

        deals.push(deal);
      });

      resolve({ deals, errors });
    };
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Export deals to Excel
 */
export function exportDealsToExcel(deals: Deal[]) {
  const wb = XLSX.utils.book_new();

  const data = deals.map(d => ({
    "Project Name": d.projectName,
    "Borrower": d.borrower,
    "Sponsor": d.sponsor,
    "Location": d.location,
    "City": d.city,
    "Stage": d.stage,
    "Asset Type": d.assetType,
    "Loan Amount (€)": d.loanAmount,
    "Disbursed (€)": d.disbursedAmount,
    "PIK Accrued (€)": d.accruedPIK,
    "Total Exposure (€)": d.totalExposure,
    "Interest Rate (%)": d.interestRate,
    "PIK Spread (%)": d.pikSpread,
    "Total Rate (%)": d.totalRate,
    "Tenor (months)": d.tenor,
    "GDV (€)": d.gdv,
    "LTV (%)": d.ltv,
    "LTC (%)": d.ltc,
    "Construction Progress (%)": d.constructionProgress,
    "Pre-Sales (%)": d.preSalesPercent,
    "Expected Maturity": d.expectedMaturity,
    "Tags": d.tags.join(", "),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = Object.keys(data[0] || {}).map(k => ({ wch: Math.max(k.length, 12) + 2 }));
  XLSX.utils.book_append_sheet(wb, ws, "Loan Book");

  XLSX.writeFile(wb, `CapitalBridge_LoanBook_${new Date().toISOString().split("T")[0]}.xlsx`);
}

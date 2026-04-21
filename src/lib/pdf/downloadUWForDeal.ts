import ExcelJS from "exceljs";
import type { Deal } from "@/data/sampleDeals";

/**
 * Loads the original UW_v1 template (preserving all styles, colors, merged
 * cells, column widths, images) and writes deal-specific values into the
 * input cells ONLY. All formulas in the workbook are preserved and will
 * recalculate automatically when the user opens the file in Excel.
 *
 * We use exceljs (not SheetJS community) because SheetJS drops styling on
 * write. exceljs preserves the full workbook structure.
 */
export async function downloadUWForDeal(deal: Deal): Promise<void> {
  // Fetch the original UW_v1 template
  const res = await fetch("/templates/UW_v1.xlsx");
  if (!res.ok) throw new Error(`Could not load UW template: ${res.status}`);
  const buf = await res.arrayBuffer();

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);

  // Force Excel to recalculate formulas on open
  wb.calcProperties.fullCalcOnLoad = true;

  // ===== Cover sheet =====
  const cover = wb.getWorksheet("Cover");
  if (cover) {
    // Deal identification block (rows 6-14)
    cover.getCell("C6").value = deal.projectName;
    cover.getCell("C7").value = deal.sponsor;
    cover.getCell("C8").value = deal.borrower;
    cover.getCell("C9").value = `${deal.location}, ${deal.city}`;
    cover.getCell("C10").value = deal.assetType;
    cover.getCell("C11").value = deal.totalArea;
    cover.getCell("C12").value = deal.totalUnits;
    // C13 Deal Date — leave TODAY() formula
    cover.getCell("C14").value = "CapitalBridge";

    // Loan Headline (rows 18-25) — write formulas that reference Inputs so
    // everything stays live. These cells were hardcoded 0 in the template.
    setFormulaCell(cover.getCell("C18"), "Inputs!D55");
    setFormulaCell(
      cover.getCell("C19"),
      "IFERROR(Inputs!D55/(Inputs!C23+Inputs!C24+Inputs!C28+Inputs!C29+Inputs!C30+Inputs!C31),0)"
    );
    setFormulaCell(cover.getCell("C20"), "IFERROR(Inputs!D55/Inputs!C18,0)");
    setFormulaCell(cover.getCell("C21"), "'Cash Flow'!C7");
    setFormulaCell(cover.getCell("C22"), "Inputs!D56");
    setFormulaCell(cover.getCell("C23"), "Inputs!D58");
    setFormulaCell(cover.getCell("C24"), "Inputs!D7");
  }

  // ===== Inputs sheet =====
  const inputs = wb.getWorksheet("Inputs");
  if (inputs) {
    // Sales plan
    inputs.getCell("C15").value = deal.totalArea || 0;
    inputs.getCell("C16").value = deal.totalUnits || 0;
    if (deal.totalArea && deal.totalArea > 0) {
      inputs.getCell("C17").value = deal.gdv / deal.totalArea;
    }

    // Costs — acquisition
    inputs.getCell("D23").value = deal.landCost;
    inputs.getCell("E24").value = 0.08; // Related acq costs (8% Spain)

    // Costs — construction (split from constructionBudget)
    if (deal.totalArea && deal.totalArea > 0) {
      inputs.getCell("D28").value = (deal.constructionBudget * 0.7) / deal.totalArea; // Hard €/sqm
      inputs.getCell("D29").value = (deal.constructionBudget * 0.2) / deal.totalArea; // Soft €/sqm
      inputs.getCell("E30").value = 0.05; // PM 5%
    }

    // Financing terms
    inputs.getCell("D55").value = deal.loanAmount;
    inputs.getCell("D56").value = deal.pikSpread / 100;
    inputs.getCell("D57").value = deal.interestRate / 100;
    inputs.getCell("D58").value = deal.originationFee / 100;

    // Duration
    inputs.getCell("D7").value = deal.tenor;
  }

  // ===== Cash Flow sheet — patch the broken summary cells =====
  // These were literal "23" in the template. Fix without altering any other formula.
  const cf = wb.getWorksheet("Cash Flow");
  if (cf) {
    setFormulaCell(cf.getCell("C7"), "MAX(H76:BO76)");
    setFormulaCell(cf.getCell("C8"), "IFERROR(MATCH(C7,H76:BO76,0),0)");
    setFormulaCell(cf.getCell("C10"), "SUM(H75:BO75)");
    setFormulaCell(cf.getCell("C11"), "SUM(H74:BO74)");
    setFormulaCell(cf.getCell("C27"), "SUM(H27:BO27)");
    setFormulaCell(cf.getCell("C30"), "SUM(H30:BO30)");
  }

  // ===== Write out =====
  const outBuf = await wb.xlsx.writeBuffer();
  const blob = new Blob([outBuf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safe = deal.projectName.replace(/[^a-zA-Z0-9-]/g, "_");
  a.href = url;
  a.download = `UW_${safe}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function setFormulaCell(cell: ExcelJS.Cell, formula: string): void {
  cell.value = { formula, date1904: false } as ExcelJS.CellFormulaValue;
}

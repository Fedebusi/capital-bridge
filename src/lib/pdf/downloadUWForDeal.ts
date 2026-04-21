import ExcelJS from "exceljs";
import type { Deal } from "@/data/sampleDeals";

export async function downloadUWForDeal(deal: Deal): Promise<void> {
  const res = await fetch("/templates/UW_v1.xlsx");
  if (!res.ok) throw new Error(`Could not load UW template: ${res.status}`);
  const buf = await res.arrayBuffer();

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);
  wb.calcProperties.fullCalcOnLoad = true;

  populateCover(wb, deal);
  populateInputs(wb, deal);
  fixCashFlow(wb);

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

function populateCover(wb: ExcelJS.Workbook, deal: Deal): void {
  const cover = wb.getWorksheet("Cover");
  if (!cover) return;

  cover.getCell("C6").value = deal.projectName;
  cover.getCell("C7").value = deal.sponsor;
  cover.getCell("C8").value = deal.borrower;
  cover.getCell("C9").value = `${deal.location}, ${deal.city}`;
  cover.getCell("C10").value = deal.assetType;
  cover.getCell("C11").value = deal.totalArea;
  cover.getCell("C12").value = deal.totalUnits;
  cover.getCell("C14").value = "CapitalBridge";

  setFormula(cover.getCell("C18"), "Inputs!D55");
  setFormula(
    cover.getCell("C19"),
    "IFERROR(Inputs!D55/(Inputs!C23+Inputs!C24+Inputs!C28+Inputs!C29+Inputs!C30+Inputs!C31),0)"
  );
  setFormula(cover.getCell("C20"), "IFERROR(Inputs!D55/Inputs!C18,0)");
  setFormula(cover.getCell("C21"), "'Cash Flow'!C7");
  setFormula(cover.getCell("C22"), "Inputs!D57");
  setFormula(cover.getCell("C23"), "Inputs!D58");
  setFormula(cover.getCell("C24"), "Inputs!D7");
}

function populateInputs(wb: ExcelJS.Workbook, deal: Deal): void {
  const inputs = wb.getWorksheet("Inputs");
  if (!inputs) return;

  // 0. General — duration & model start date
  inputs.getCell("D7").value = deal.tenor;
  const startDate = deal.firstDrawdownDate
    ? new Date(deal.firstDrawdownDate)
    : deal.closingDate
      ? new Date(deal.closingDate)
      : new Date();
  inputs.getCell("F7").value = startDate;

  // 1. Sales plan
  inputs.getCell("C15").value = deal.totalArea || 0;
  inputs.getCell("C16").value = deal.totalUnits || 0;
  if (deal.totalArea && deal.totalArea > 0) {
    inputs.getCell("C17").value = deal.gdv / deal.totalArea;
  }

  // 2. Costs — acquisition
  inputs.getCell("D23").value = deal.landCost;
  inputs.getCell("E24").value = 0.08;

  // Costs — construction (split hard 70% / soft 20% / PM 5%)
  if (deal.totalArea && deal.totalArea > 0) {
    inputs.getCell("D28").value = (deal.constructionBudget * 0.7) / deal.totalArea;
    inputs.getCell("D29").value = (deal.constructionBudget * 0.2) / deal.totalArea;
    inputs.getCell("E30").value = 0.05;
  }

  // 3. Financing terms
  inputs.getCell("D55").value = deal.loanAmount;
  inputs.getCell("D56").value = deal.tenor;
  inputs.getCell("D57").value = deal.totalRate / 100;
  inputs.getCell("D58").value = deal.originationFee / 100;

  // 4. Timing — derive from tenor
  const acqMonths = Math.min(3, Math.floor(deal.tenor * 0.15));
  const constMonths = Math.max(6, Math.floor(deal.tenor * 0.65));
  const salesOffset = Math.max(1, Math.floor(constMonths * 0.3));
  const salesWindow = constMonths + 3;
  inputs.getCell("D65").value = Math.max(acqMonths, 1);
  inputs.getCell("D66").value = constMonths;
  inputs.getCell("D67").value = salesOffset;
  inputs.getCell("D68").value = salesWindow;

  // 5. Sales payment schedule
  inputs.getCell("D74").value = 0.15;
  inputs.getCell("D75").value = 0.25;
  inputs.getCell("D76").value = 0.60;
  inputs.getCell("D77").value = 2;
}

function fixCashFlow(wb: ExcelJS.Workbook): void {
  const cf = wb.getWorksheet("Cash Flow");
  if (!cf) return;

  // Summary cells
  setFormula(cf.getCell("C5"), "Inputs!D55");
  setFormula(cf.getCell("C6"), "SUM(H73:BO73)");
  setFormula(cf.getCell("C7"), "MAX(H76:BO76)");
  setFormula(cf.getCell("C8"), "IFERROR(MATCH(C7,H76:BO76,0),0)");
  setFormula(cf.getCell("C10"), "SUM(H75:BO75)");
  setFormula(cf.getCell("C11"), "SUM(H74:BO74)");
  setFormula(cf.getCell("C12"), "SUM(H72:BO72)");

  // Fix row 75 (Principal repayment) — template has #REF! in every column.
  // Sweep = 50% of sales proceeds, capped at outstanding balance.
  for (let c = 8; c <= 67; c++) {
    const col = colLetter(c);
    if (c === 8) {
      setFormula(
        cf.getCell(`${col}75`),
        `MIN(${col}55*0.5,${col}73+${col}72+${col}74)`
      );
    } else {
      const prev = colLetter(c - 1);
      setFormula(
        cf.getCell(`${col}75`),
        `MIN(${col}55*0.5,${prev}76+${col}73+${col}72+${col}74)`
      );
    }
  }
}

function colLetter(n: number): string {
  let s = "";
  let v = n;
  while (v > 0) {
    v--;
    s = String.fromCharCode(65 + (v % 26)) + s;
    v = Math.floor(v / 26);
  }
  return s;
}

function setFormula(cell: ExcelJS.Cell, formula: string): void {
  cell.value = { formula, date1904: false } as ExcelJS.CellFormulaValue;
}

import ExcelJS from "exceljs";
import type { Deal } from "@/data/sampleDeals";

const TEAL = "004D61";
const TEAL_LIGHT = "E6F0F3";
const PINK = "E91E63";
const WHITE = "FFFFFF";
const GRAY = "F5F5F5";
const DARK = "1A1A2E";

export async function downloadICMemoForDeal(deal: Deal): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.calcProperties.fullCalcOnLoad = true;

  buildApprovalSheet(wb, deal);

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safe = deal.projectName.replace(/[^a-zA-Z0-9-]/g, "_");
  a.href = url;
  a.download = `ICMemo_${safe}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function buildApprovalSheet(wb: ExcelJS.Workbook, deal: Deal): void {
  const ws = wb.addWorksheet("Approval Document", {
    pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true },
  });

  ws.columns = Array.from({ length: 20 }, (_, i) => ({
    width: i === 0 ? 2 : i <= 2 ? 14 : 13,
  }));

  let row = 1;

  // === HEADER ===
  row = writeHeader(ws, row, deal);

  // === SECTION 1: General Asset Information + Location ===
  row = writeSectionTitle(ws, row, "Collateral Analysis & Project Economics");
  row++;
  row = writeAssetInfo(ws, row, deal);
  row++;

  // === SECTION 2: Project Economics ===
  row = writeProjectEconomics(ws, row, deal);
  row++;

  // === SECTION 3: Lending Terms ===
  row = writeLendingTerms(ws, row, deal);
  row++;

  // === SECTION 4: Sources & Uses ===
  row = writeSourcesUses(ws, row, deal);
  row++;

  // === SECTION 5: Security Package ===
  row = writeSecurityPackage(ws, row);
  row++;

  // === SECTION 6: Risk Matrix ===
  row = writeRiskMatrix(ws, row);
  row++;

  // === SECTION 7: Qualitative View ===
  row = writeQualitativeView(ws, row, deal);
}

function writeHeader(ws: ExcelJS.Worksheet, startRow: number, deal: Deal): number {
  const r = startRow;
  const titleCell = ws.getCell(r, 2);
  titleCell.value = `CapitalBridge — Lending Platform — ${deal.projectName}`;
  titleCell.font = { name: "Calibri", size: 16, bold: true, color: { argb: WHITE } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TEAL } };
  titleCell.alignment = { vertical: "middle" };
  ws.mergeCells(r, 2, r, 15);
  ws.getRow(r).height = 36;

  const subCell = ws.getCell(r + 1, 2);
  subCell.value = `Investment Committee — Approval Document — ${new Date().toLocaleDateString("en-GB")}`;
  subCell.font = { name: "Calibri", size: 10, italic: true, color: { argb: WHITE } };
  subCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TEAL } };
  ws.mergeCells(r + 1, 2, r + 1, 15);

  return r + 3;
}

function writeSectionTitle(ws: ExcelJS.Worksheet, row: number, title: string): number {
  const cell = ws.getCell(row, 2);
  cell.value = title;
  cell.font = { name: "Calibri", size: 12, bold: true, color: { argb: TEAL } };
  cell.border = { bottom: { style: "medium", color: { argb: PINK } } };
  ws.mergeCells(row, 2, row, 10);
  return row + 1;
}

function writeAssetInfo(ws: ExcelJS.Worksheet, startRow: number, deal: Deal): number {
  let r = startRow;
  const subTitle = ws.getCell(r, 2);
  subTitle.value = "General Asset Information";
  subTitle.font = { name: "Calibri", size: 10, bold: true, color: { argb: TEAL } };
  const locTitle = ws.getCell(r, 8);
  locTitle.value = "Location & Overview";
  locTitle.font = { name: "Calibri", size: 10, bold: true, color: { argb: TEAL } };
  r++;

  const info: [string, string | number][] = [
    ["Address", `${deal.location}, ${deal.city}`],
    ["Municipality", deal.city],
    ["Asset Typology", deal.assetType],
    ["Total Surface (sqm)", deal.totalArea || 0],
    ["Total Units", deal.totalUnits || 0],
    ["Construction Progress", `${deal.constructionProgress}%`],
  ];

  const timeline: [string, string][] = [
    ["Construction Time", `${Math.max(6, Math.floor(deal.tenor * 0.65))} months`],
    ["LPO Time", "2 months"],
    ["Commercialization", `${Math.max(6, deal.tenor - Math.floor(deal.tenor * 0.65))} months`],
  ];

  for (let i = 0; i < Math.max(info.length, timeline.length); i++) {
    if (i < info.length) {
      labelValue(ws, r, 2, 4, info[i][0], info[i][1]);
    }
    if (i < timeline.length) {
      labelValue(ws, r, 8, 10, timeline[i][0], timeline[i][1]);
    }
    r++;
  }
  return r;
}

function writeProjectEconomics(ws: ExcelJS.Worksheet, startRow: number, deal: Deal): number {
  let r = startRow;
  r = writeSectionTitle(ws, r, "Project Economics — Sponsor Cash Flow");
  r++;

  const area = deal.totalArea || 1;
  const aboveGround = Math.round(area * 0.84);

  const headers = ["", "€", "€/sqm"];
  for (let i = 0; i < headers.length; i++) {
    const cell = ws.getCell(r, 2 + i * 3);
    cell.value = headers[i];
    cell.font = { name: "Calibri", size: 9, bold: true, color: { argb: WHITE } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TEAL } };
  }
  r++;

  const saleProceeds = deal.gdv;
  const acqCost = deal.landCost + deal.landCost * 0.08;
  const constCost = deal.constructionBudget;
  const totalCost = acqCost + constCost;
  const sponsorMargin = saleProceeds - totalCost;

  const rows: [string, number, number][] = [
    ["(+) Sale Proceeds", saleProceeds, saleProceeds / aboveGround],
    ["(-) Acquisition Cost", -acqCost, acqCost / area],
    ["(-) Construction Works", -constCost, constCost / area],
    ["Sponsor Margin", sponsorMargin, sponsorMargin / saleProceeds],
  ];

  for (const [label, eur, perSqm] of rows) {
    const lbl = ws.getCell(r, 2);
    lbl.value = label;
    lbl.font = { name: "Calibri", size: 9, bold: label === "Sponsor Margin" };
    ws.mergeCells(r, 2, r, 4);

    const valCell = ws.getCell(r, 5);
    valCell.value = Math.round(eur);
    valCell.numFmt = "#,##0";
    valCell.font = { name: "Calibri", size: 9 };

    const sqmCell = ws.getCell(r, 8);
    sqmCell.value = label === "Sponsor Margin" ? perSqm : Math.round(perSqm);
    sqmCell.numFmt = label === "Sponsor Margin" ? "0.0%" : "#,##0";
    sqmCell.font = { name: "Calibri", size: 9 };

    if (label === "Sponsor Margin") {
      for (let c = 2; c <= 10; c++) {
        ws.getCell(r, c).border = { top: { style: "thin", color: { argb: TEAL } } };
        ws.getCell(r, c).font = { name: "Calibri", size: 9, bold: true, color: { argb: TEAL } };
      }
    }
    r++;
  }
  return r;
}

function writeLendingTerms(ws: ExcelJS.Worksheet, startRow: number, deal: Deal): number {
  let r = startRow;
  r = writeSectionTitle(ws, r, "Lending Terms");
  r++;

  const typology = deal.constructionProgress > 0 ? "WIP" : "Land";
  const terms: [string, string | number][] = [
    ["Project Typology", typology],
    ["Debt Amount", `€${(deal.loanAmount / 1e6).toFixed(1)}M`],
    ["Interest Expense (PIK)", `${deal.totalRate.toFixed(1)}%`],
    ["Structuring Fee", `${deal.originationFee.toFixed(1)}%`],
    ["Exit Fee", `${deal.exitFee.toFixed(1)}%`],
    ["Initial Term", `${deal.tenor} months`],
    ["Amortization", "Bullet"],
    ["Interest Type", "PIK (capitalized)"],
    ["Pre-sales", `${deal.preSalesPercent.toFixed(0)}%`],
  ];

  const leftTerms = terms.slice(0, 5);
  const rightTerms = terms.slice(5);

  for (let i = 0; i < Math.max(leftTerms.length, rightTerms.length); i++) {
    if (i < leftTerms.length) {
      labelValue(ws, r, 2, 4, leftTerms[i][0], leftTerms[i][1]);
    }
    if (i < rightTerms.length) {
      labelValue(ws, r, 8, 10, rightTerms[i][0], rightTerms[i][1]);
    }
    r++;
  }
  return r;
}

function writeSourcesUses(ws: ExcelJS.Worksheet, startRow: number, deal: Deal): number {
  let r = startRow;
  r = writeSectionTitle(ws, r, "Sources & Uses of Funds");
  r++;

  const equity = deal.landCost;
  const debt = deal.loanAmount;
  const pikEst = debt * (deal.totalRate / 100) * (deal.tenor / 12);
  const totalSources = equity + debt + pikEst;

  const acqCost = deal.landCost + deal.landCost * 0.08;
  const constCost = deal.constructionBudget;
  const openingFee = debt * (deal.originationFee / 100);
  const totalUses = acqCost + constCost + openingFee + pikEst;

  const hdrFont: Partial<ExcelJS.Font> = { name: "Calibri", size: 9, bold: true, color: { argb: WHITE } };
  const hdrFill: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: TEAL } };

  const srcH = ws.getCell(r, 2);
  srcH.value = "Sources of Funds";
  srcH.font = hdrFont;
  srcH.fill = hdrFill;
  ws.mergeCells(r, 2, r, 4);

  const useH = ws.getCell(r, 8);
  useH.value = "Uses of Funds";
  useH.font = hdrFont;
  useH.fill = hdrFill;
  ws.mergeCells(r, 8, r, 10);
  r++;

  const sources: [string, number][] = [
    ["Sponsor Equity", equity],
    ["Lending Platform Debt", debt],
    ["PIK Interests (est.)", pikEst],
    ["TOTAL SOURCES", totalSources],
  ];
  const uses: [string, number][] = [
    ["Acquisition Cost", acqCost],
    ["Construction Works", constCost],
    ["Opening Fee", openingFee],
    ["PIK Interests", pikEst],
    ["TOTAL USES", totalUses],
  ];

  for (let i = 0; i < Math.max(sources.length, uses.length); i++) {
    if (i < sources.length) {
      const isTotal = sources[i][0].startsWith("TOTAL");
      fundRow(ws, r, 2, sources[i][0], sources[i][1], isTotal);
    }
    if (i < uses.length) {
      const isTotal = uses[i][0].startsWith("TOTAL");
      fundRow(ws, r, 8, uses[i][0], uses[i][1], isTotal);
    }
    r++;
  }
  return r;
}

function writeSecurityPackage(ws: ExcelJS.Worksheet, startRow: number): number {
  let r = startRow;
  r = writeSectionTitle(ws, r, "Security Package");
  r++;

  const items = [
    "First ranking mortgage",
    "Pledge over shares",
    "Pledge over sponsor shares and subordinated debt",
    "Pledge over bank accounts & contracts",
    "Lender as insurance beneficiary",
    "Ability to sell the property",
    "Step-in rights",
  ];

  for (const item of items) {
    const lbl = ws.getCell(r, 2);
    lbl.value = item;
    lbl.font = { name: "Calibri", size: 9 };
    ws.mergeCells(r, 2, r, 7);

    const status = ws.getCell(r, 8);
    status.value = "OK";
    status.font = { name: "Calibri", size: 9, bold: true, color: { argb: "2E7D32" } };
    r++;
  }
  return r;
}

function writeRiskMatrix(ws: ExcelJS.Worksheet, startRow: number): number {
  let r = startRow;
  r = writeSectionTitle(ws, r, "Risk Assessment");
  r++;

  const riskH: Partial<ExcelJS.Font> = { name: "Calibri", size: 9, bold: true, color: { argb: WHITE } };
  const riskFill: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: TEAL } };

  for (const [col, text] of [[2, "Risk"], [8, "Mitigation Measures"]] as const) {
    const c = ws.getCell(r, col);
    c.value = text;
    c.font = riskH;
    c.fill = riskFill;
    ws.mergeCells(r, col, r, col + 4);
  }
  r++;

  const risks: [string, string][] = [
    ["Lower than expected sale prices", "Data-driven assessment + Limited LTV"],
    ["Higher construction costs/period", "Comprehensive project review + Monitoring"],
    ["Borrower default", "First-ranking mortgage + Step-in rights"],
    ["Market downturn", "Conservative LTV/LTC limits + Pre-sales requirement"],
  ];

  for (const [risk, mitigation] of risks) {
    const rCell = ws.getCell(r, 2);
    rCell.value = risk;
    rCell.font = { name: "Calibri", size: 9 };
    ws.mergeCells(r, 2, r, 6);

    const mCell = ws.getCell(r, 8);
    mCell.value = mitigation;
    mCell.font = { name: "Calibri", size: 9 };
    ws.mergeCells(r, 8, r, 14);
    r++;
  }
  return r;
}

function writeQualitativeView(ws: ExcelJS.Worksheet, startRow: number, deal: Deal): number {
  let r = startRow;
  r = writeSectionTitle(ws, r, "Clikalia Qualitative View — IC Recommendation");
  r++;

  const area = deal.totalArea || 1;
  const ltc = (deal.loanAmount / (deal.landCost + deal.constructionBudget) * 100).toFixed(0);
  const ltv = (deal.loanAmount / deal.gdv * 100).toFixed(0);

  const text = [
    `${deal.assetType} project located in ${deal.location}, ${deal.city}. ` +
    `Total ${deal.totalUnits} units across ${deal.totalArea?.toLocaleString() ?? 0} sqm. ` +
    `Current construction progress: ${deal.constructionProgress}%.`,
    `Loan facility of €${(deal.loanAmount / 1e6).toFixed(1)}M with ${deal.tenor}-month tenor. ` +
    `LTC ${ltc}%, LTV ${ltv}%, pre-sales ${deal.preSalesPercent.toFixed(0)}%.`,
    `Sponsor: ${deal.sponsor} (${deal.borrower}). ` +
    `Developer experience: ${deal.developerExperience}, track record: ${deal.developerTrackRecord} projects.`,
  ];

  for (const line of text) {
    const cell = ws.getCell(r, 2);
    cell.value = line;
    cell.font = { name: "Calibri", size: 9 };
    cell.alignment = { wrapText: true };
    ws.mergeCells(r, 2, r, 14);
    ws.getRow(r).height = 30;
    r++;
  }

  r++;
  const rec = ws.getCell(r, 2);
  rec.value = "RECOMMENDATION: APPROVE";
  rec.font = { name: "Calibri", size: 12, bold: true, color: { argb: WHITE } };
  rec.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "2E7D32" } };
  rec.alignment = { horizontal: "center", vertical: "middle" };
  ws.mergeCells(r, 2, r, 8);
  ws.getRow(r).height = 28;

  return r + 1;
}

// --- Helpers ---

function labelValue(
  ws: ExcelJS.Worksheet, row: number,
  labelCol: number, valueCol: number,
  label: string, value: string | number,
): void {
  const lbl = ws.getCell(row, labelCol);
  lbl.value = label;
  lbl.font = { name: "Calibri", size: 9, color: { argb: "666666" } };

  const val = ws.getCell(row, valueCol);
  val.value = value;
  val.font = { name: "Calibri", size: 9, bold: true, color: { argb: DARK } };
}

function fundRow(
  ws: ExcelJS.Worksheet, row: number, startCol: number,
  label: string, amount: number, isTotal: boolean,
): void {
  const lbl = ws.getCell(row, startCol);
  lbl.value = label;
  lbl.font = { name: "Calibri", size: 9, bold: isTotal, color: { argb: isTotal ? TEAL : DARK } };
  ws.mergeCells(row, startCol, row, startCol + 1);

  const val = ws.getCell(row, startCol + 2);
  val.value = Math.round(amount);
  val.numFmt = "#,##0";
  val.font = { name: "Calibri", size: 9, bold: isTotal, color: { argb: isTotal ? TEAL : DARK } };

  if (isTotal) {
    for (let c = startCol; c <= startCol + 2; c++) {
      ws.getCell(row, c).border = { top: { style: "thin", color: { argb: TEAL } } };
    }
  }
}

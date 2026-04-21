import ExcelJS from "exceljs";
import type { Deal } from "@/data/sampleDeals";

export async function downloadICMemoForDeal(deal: Deal): Promise<void> {
  const res = await fetch("/templates/ICMemo_v1.xlsx");
  if (!res.ok) throw new Error(`Could not load IC Memo template: ${res.status}`);
  const buf = await res.arrayBuffer();

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);
  wb.calcProperties.fullCalcOnLoad = true;

  const ws = wb.getWorksheet("Approval Document");
  if (!ws) throw new Error("Approval Document sheet not found");

  populateHeader(ws, deal);
  populateAssetInfo(ws, deal);
  populateProjectEconomics(ws, deal);
  populateLendingTerms(ws, deal);
  populateSponsor(ws, deal);
  populateHiddenData(ws, deal);
  populateCalendar(ws, deal);

  const outBuf = await wb.xlsx.writeBuffer();
  const blob = new Blob([outBuf], {
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

function populateHeader(ws: ExcelJS.Worksheet, deal: Deal): void {
  for (const col of ["M", "N", "O"]) {
    ws.getCell(`${col}9`).value = deal.projectName;
    ws.getCell(`${col}10`).value = deal.projectName;
  }
  for (const col of ["M", "N", "O", "P", "Q", "R", "S"]) {
    ws.getCell(`${col}78`).value = deal.projectName;
    ws.getCell(`${col}79`).value = deal.projectName;
  }
}

function populateAssetInfo(ws: ExcelJS.Worksheet, deal: Deal): void {
  ws.getCell("I17").value = `${deal.location}, ${deal.city}`;
  ws.getCell("I18").value = deal.city;
  ws.getCell("I19").value = deal.assetType;
  ws.getCell("I20").value = deal.totalArea || 0;

  const aboveGround = deal.totalArea
    ? Math.round(deal.totalArea * 0.84)
    : 0;
  ws.getCell("I21").value = aboveGround;

  ws.getCell("E24").value = deal.totalUnits || 0;

  const progress = deal.constructionProgress / 100;
  ws.getCell("G36").value = progress;
  ws.getCell("H36").value = progress;
  ws.getCell("I36").value = progress;

  const constMonths = Math.max(6, Math.floor(deal.tenor * 0.65));
  ws.getCell("H38").value = `${constMonths} months`;
  ws.getCell("I38").value = `${constMonths} months`;
  ws.getCell("H39").value = "2 months";
  ws.getCell("I39").value = "2 months";
  const commMonths = Math.max(6, deal.tenor - constMonths);
  ws.getCell("H40").value = `${commMonths} months`;
  ws.getCell("I40").value = `${commMonths} months`;
}

function populateProjectEconomics(ws: ExcelJS.Worksheet, deal: Deal): void {
  const area = deal.totalArea || 1;
  const aboveGround = Math.round(area * 0.84);

  const salePricePerSqm = deal.gdv / aboveGround;
  ws.getCell("N46").value = salePricePerSqm;
  ws.getCell("O46").value = salePricePerSqm;

  const acqPricePerSqm = deal.landCost / area;
  ws.getCell("N48").value = acqPricePerSqm;
  ws.getCell("O48").value = acqPricePerSqm;

  const relatedCosts = -(deal.landCost * 0.08);
  ws.getCell("L49").value = relatedCosts;
  ws.getCell("M49").value = relatedCosts;

  const hardCostsPerSqm = (deal.constructionBudget * 0.7) / area;
  ws.getCell("N52").value = hardCostsPerSqm;
  ws.getCell("O52").value = hardCostsPerSqm;

  const pmCosts = -(deal.constructionBudget * 0.1);
  ws.getCell("L53").value = pmCosts;
  ws.getCell("M53").value = pmCosts;
}

function populateLendingTerms(ws: ExcelJS.Worksheet, deal: Deal): void {
  ws.getCell("Z19").value = deal.totalRate / 100;
  ws.getCell("Z20").value = deal.originationFee / 100;
  ws.getCell("Z21").value = deal.exitFee / 100;

  ws.getCell("AB16").value = deal.loanAmount;
  ws.getCell("AC16").value = deal.loanAmount;

  ws.getCell("AD24").value = deal.preSalesPercent / 100;
}

function populateSponsor(ws: ExcelJS.Worksheet, deal: Deal): void {
  const equity = deal.landCost;
  ws.getCell("Z35").value = equity;

  ws.getCell("AD33").value = deal.developerExperience || "+10 years";
}

function populateHiddenData(ws: ExcelJS.Worksheet, deal: Deal): void {
  const typology = deal.constructionProgress > 0 ? "WIP" : "Land";
  ws.getCell("AD15").value = typology;
  ws.getCell("AD16").value = deal.loanAmount;
  ws.getCell("AC19").value = deal.tenor;
  ws.getCell("AD19").value = deal.tenor;
  ws.getCell("AD20").value = 6;

  if (deal.closingDate) {
    ws.getCell("AD22").value = new Date(deal.closingDate);
  }
  if (deal.termSheetDate) {
    ws.getCell("AD21").value = new Date(deal.termSheetDate);
  }

  ws.getCell("AD26").value = "Monthly";
  ws.getCell("AD28").value = "Bullet";
  ws.getCell("AD29").value = "PIK";
}

function populateCalendar(ws: ExcelJS.Worksheet, deal: Deal): void {
  const start = deal.firstDrawdownDate
    ? new Date(deal.firstDrawdownDate)
    : deal.closingDate
      ? new Date(deal.closingDate)
      : new Date();

  const constMonths = Math.max(6, Math.floor(deal.tenor * 0.65));

  const acqEnd = new Date(start);
  acqEnd.setMonth(acqEnd.getMonth() + 3);

  const constEnd = new Date(acqEnd);
  constEnd.setMonth(constEnd.getMonth() + constMonths);

  const commEnd = new Date(constEnd);
  commEnd.setMonth(commEnd.getMonth() + (deal.tenor - constMonths));

  ws.getCell("AR136").value = start;
  ws.getCell("AR137").value = acqEnd;
  ws.getCell("AR138").value = constEnd;
  ws.getCell("AR139").value = commEnd;
}

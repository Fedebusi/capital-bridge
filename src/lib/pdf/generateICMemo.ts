import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Deal } from "@/data/sampleDeals";

// Brand colors (Clikalia-inspired — dark teal + pink accent)
const NAVY: [number, number, number] = [36, 66, 82];
const TEAL: [number, number, number] = [50, 95, 115];
const PINK: [number, number, number] = [232, 65, 125];
const PINK_SOFT: [number, number, number] = [252, 228, 236];
const TEXT: [number, number, number] = [20, 30, 45];
const MUTED: [number, number, number] = [120, 130, 140];
const LIGHT: [number, number, number] = [240, 243, 245];
const CELL: [number, number, number] = [230, 235, 240];
const GREEN_OK: [number, number, number] = [212, 235, 220];

function fmtCurrency(n: number): string {
  if (!isFinite(n)) return "—";
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(n) + " €";
}
function fmtMillions(n: number): string {
  return `€${(n / 1_000_000).toFixed(1)}M`;
}
function fmtPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

export function generateICMemo(deal: Deal): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth(); // 297
  const pageH = doc.internal.pageSize.getHeight(); // 210
  const margin = 6;
  const contentW = pageW - margin * 2;

  // =====================================
  // PAGE 1 — OVERVIEW + FINANCING
  // =====================================
  drawHeader(doc, deal, pageW);

  // Section bar
  drawSectionBar(doc, margin, 38, contentW, "Collateral Analysis & Project Economics Overview");

  let y = 46;

  // Row: General Asset Info | Location & Overview | Debt & Funds
  const colW = (contentW - 4) / 3;

  // --- LEFT: General Asset Information ---
  drawBlockHeader(doc, margin, y, colW, "General Asset Information");
  autoTable(doc, {
    startY: y + 5,
    margin: { left: margin, right: pageW - margin - colW },
    theme: "plain",
    styles: { fontSize: 7.5, cellPadding: 1.2 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 28 }, 1: { textColor: TEXT } },
    body: [
      ["Address", deal.location],
      ["Municipality | Province", `${deal.city} | —`],
      ["Asset Typology", deal.assetType],
      ["Total Surface", `${deal.totalArea.toLocaleString("de-DE")} sqm`],
      ["Total Units", `${deal.totalUnits}`],
      ["Pre-Sales", fmtPct(deal.preSalesPercent)],
      ["GDV", fmtMillions(deal.gdv)],
      ["Current Appraisal", fmtMillions(deal.currentAppraisal || deal.gdv * 0.7)],
    ],
  });

  // --- MIDDLE: Location Overview ---
  const midX = margin + colW + 2;
  drawBlockHeader(doc, midX, y, colW, "Location & Overview");
  let y2 = y + 6;
  doc.setFontSize(8);
  doc.setTextColor(...TEXT);
  doc.text(`${deal.location}, ${deal.city}`, midX + 2, y2);
  y2 += 4;
  doc.setFont("helvetica", "bold");
  doc.text("Driving Distance", midX + 2, y2);
  doc.setFont("helvetica", "normal");
  y2 += 4;
  doc.text(`Madrid    4h 30'`, midX + 2, y2);
  y2 += 3.5;
  doc.text(`Barcelona 5h 15'`, midX + 2, y2);
  y2 += 3.5;
  doc.text(`Malaga    2h 20'`, midX + 2, y2);
  y2 += 6;
  doc.setFillColor(...LIGHT);
  doc.roundedRect(midX + 2, y2, colW - 4, 30, 2, 2, "F");
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text("(Map preview — edit in detail view)", midX + 4, y2 + 15);

  // --- RIGHT: Debt & Funds Financing ---
  const rightX = midX + colW + 2;
  drawBlockHeader(doc, rightX, y, colW, "Debt & Funds — Financing Operation");
  // Project typology + Debt amount headline
  doc.setFillColor(...PINK_SOFT);
  doc.roundedRect(rightX, y + 6, colW, 10, 1.5, 1.5, "F");
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text("Project Typology", rightX + 2, y + 10);
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("WIP", rightX + colW - 4, y + 10, { align: "right" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text("Debt Amount", rightX + 2, y + 14.5);
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(fmtCurrency(deal.loanAmount), rightX + colW - 4, y + 14.5, { align: "right" });

  // Economics + Duration
  autoTable(doc, {
    startY: y + 18,
    margin: { left: rightX, right: margin },
    theme: "plain",
    styles: { fontSize: 7, cellPadding: 1 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 28 },
      1: { cellWidth: 15, textColor: PINK, fontStyle: "bold", halign: "right" },
      2: { fontStyle: "bold", cellWidth: 28 },
      3: { halign: "right" },
    },
    body: [
      ["Interest Rate", fmtPct(deal.interestRate), "Initial Term", `${deal.tenor} months`],
      ["PIK Spread", fmtPct(deal.pikSpread), "Potential Extens.", "6 months"],
      ["Origination Fee", fmtPct(deal.originationFee), "Expected DD Start", "—"],
      ["Exit Fee", fmtPct(deal.exitFee), "Expected Closing", deal.expectedMaturity || "—"],
    ],
  });

  // Second row: Asset Situation | Project Background | Sponsor / Calendar
  const lastYRef = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable;
  y = Math.max(y + 65, (lastYRef?.finalY ?? 100) + 4);

  drawBlockHeader(doc, margin, y, colW, "Asset Situation");
  autoTable(doc, {
    startY: y + 5,
    margin: { left: margin, right: pageW - margin - colW },
    theme: "plain",
    styles: { fontSize: 7.5, cellPadding: 1.2 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 35 }, 1: { textColor: PINK, fontStyle: "bold" } },
    body: [
      ["Urban Plot of Land", "Yes"],
      ["Urbanization Plan", "Yes"],
      ["License Status", deal.stage === "active" ? "Obtained" : "Pending"],
      ["Construction Progress", fmtPct(deal.constructionProgress)],
      ["LPO Time", "2 months"],
      ["Commercialization Time", `${Math.max(12, deal.tenor - 6)} months`],
    ],
  });

  drawBlockHeader(doc, midX, y, colW, "Project Background");
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT);
  const bg = deal.description || "Internally sourced asset — market opportunity aligned with the fund's mandate (senior debt, Spanish residential development).";
  const bgLines = doc.splitTextToSize(bg, colW - 4);
  doc.text(bgLines.slice(0, 6), midX + 2, y + 7);

  drawBlockHeader(doc, rightX, y, colW, "Sponsor");
  autoTable(doc, {
    startY: y + 5,
    margin: { left: rightX, right: margin },
    theme: "plain",
    styles: { fontSize: 7.5, cellPadding: 1.2 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 30 } },
    body: [
      ["Name", deal.sponsor],
      ["Country", "Spain"],
      ["Project Role", "Developer"],
      ["Track Record", `${deal.developerExperience} · ${deal.developerTrackRecord} projects`],
      ["Committed Equity", fmtMillions(deal.loanAmount * 0.3)],
    ],
  });

  // --- FOOTER page 1 ---
  drawPageFooter(doc, 1, pageW, pageH);

  // =====================================
  // PAGE 2 — ECONOMICS & MARKET
  // =====================================
  doc.addPage();
  drawHeader(doc, deal, pageW);

  drawSectionBar(doc, margin, 38, contentW, "Project Economics & Financing Structure");

  y = 46;
  const colW2 = (contentW - 4) / 2;

  // --- LEFT: Project Economics ---
  drawBlockHeader(doc, margin, y, colW2, "Sponsor Cash Flow");

  const salePrice = deal.gdv;
  const landCost = deal.landCost;
  const hardCost = deal.constructionBudget * 0.7;
  const softCost = deal.constructionBudget * 0.2;
  const pmCost = deal.constructionBudget * 0.05;
  const relatedCost = landCost * 0.08;
  const sponsorMargin = salePrice - landCost - relatedCost - hardCost - softCost - pmCost;
  const pikAndFee = deal.loanAmount * (deal.pikSpread / 100) * (deal.tenor / 12) + deal.loanAmount * (deal.originationFee / 100);
  const netMargin = sponsorMargin - pikAndFee;
  const sqm = deal.totalArea || 1;

  autoTable(doc, {
    startY: y + 5,
    margin: { left: margin, right: pageW - margin - colW2 },
    theme: "plain",
    styles: { fontSize: 7.5, cellPadding: 1.2 },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { halign: "right", cellWidth: 28, fontStyle: "bold" },
      2: { halign: "right", textColor: MUTED, cellWidth: 22 },
    },
    body: [
      [{ content: "(+) Sale Proceeds", styles: { fontStyle: "bold" } }, fmtCurrency(salePrice), `${Math.round(salePrice / sqm)} €/sqm`],
      [{ content: "(−) Acquisition Cost", styles: { fontStyle: "bold" } }, fmtCurrency(-landCost - relatedCost), `${Math.round((landCost + relatedCost) / sqm)} €/sqm`],
      ["    Acquisition Price", fmtCurrency(-landCost), `${Math.round(landCost / sqm)} €/sqm`],
      ["    Related Costs", fmtCurrency(-relatedCost), "8%"],
      [{ content: "(−) Construction Works", styles: { fontStyle: "bold" } }, fmtCurrency(-hardCost - softCost - pmCost), ""],
      ["    Hard Costs", fmtCurrency(-hardCost), `${Math.round(hardCost / sqm)} €/sqm`],
      ["    Soft Costs", fmtCurrency(-softCost), `${Math.round(softCost / sqm)} €/sqm`],
      ["    Project Management", fmtCurrency(-pmCost), "5%"],
      [{ content: "Sponsor Margin", styles: { fontStyle: "bold", fillColor: LIGHT } }, { content: fmtCurrency(sponsorMargin), styles: { fillColor: LIGHT } }, { content: fmtPct((sponsorMargin / salePrice) * 100), styles: { fillColor: LIGHT } }],
      ["(−) PIK + Opening Fee", fmtCurrency(-pikAndFee), ""],
      [{ content: "Sponsor Net Margin", styles: { fontStyle: "bold", fillColor: PINK_SOFT, textColor: NAVY } }, { content: fmtCurrency(netMargin), styles: { fillColor: PINK_SOFT, textColor: NAVY, fontStyle: "bold" } }, { content: fmtPct((netMargin / salePrice) * 100), styles: { fillColor: PINK_SOFT, textColor: NAVY, fontStyle: "bold" } }],
    ],
  });

  // --- RIGHT: Sources & Uses ---
  const rightX2 = margin + colW2 + 2;
  drawBlockHeader(doc, rightX2, y, colW2, "Sources & Uses of Funds");

  const equity = sponsorMargin > 0 ? landCost * 0.4 : landCost * 0.3;
  const totalSources = equity + deal.loanAmount + pikAndFee;
  const totalUses = landCost + hardCost + softCost + pmCost + relatedCost + pikAndFee;

  autoTable(doc, {
    startY: y + 5,
    margin: { left: rightX2, right: margin },
    theme: "plain",
    styles: { fontSize: 7.5, cellPadding: 1.2 },
    columnStyles: { 0: { cellWidth: 50 }, 1: { halign: "right", fontStyle: "bold" } },
    head: [
      [{ content: "Sources", styles: { fillColor: TEAL, textColor: [255, 255, 255], fontSize: 8 } }, { content: "€", styles: { fillColor: TEAL, textColor: [255, 255, 255], halign: "right" } }],
    ],
    body: [
      ["Sponsor Equity", fmtCurrency(equity)],
      ["Lending Platform Debt", fmtCurrency(deal.loanAmount)],
      ["PIK Interests", fmtCurrency(pikAndFee)],
      [{ content: "TOTAL SOURCES", styles: { fontStyle: "bold", fillColor: LIGHT } }, { content: fmtCurrency(totalSources), styles: { fontStyle: "bold", fillColor: LIGHT } }],
    ],
  });

  const afterSources = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable;
  autoTable(doc, {
    startY: (afterSources?.finalY ?? y + 30) + 2,
    margin: { left: rightX2, right: margin },
    theme: "plain",
    styles: { fontSize: 7.5, cellPadding: 1.2 },
    columnStyles: { 0: { cellWidth: 50 }, 1: { halign: "right", fontStyle: "bold" } },
    head: [
      [{ content: "Uses", styles: { fillColor: TEAL, textColor: [255, 255, 255], fontSize: 8 } }, { content: "€", styles: { fillColor: TEAL, textColor: [255, 255, 255], halign: "right" } }],
    ],
    body: [
      ["Acquisition Cost", fmtCurrency(landCost + relatedCost)],
      ["Construction Works", fmtCurrency(hardCost + softCost + pmCost)],
      ["PIK Interests", fmtCurrency(pikAndFee)],
      [{ content: "TOTAL USES", styles: { fontStyle: "bold", fillColor: LIGHT } }, { content: fmtCurrency(totalUses), styles: { fontStyle: "bold", fillColor: LIGHT } }],
    ],
  });

  // Stress / Risk band lower down
  y = 160;
  drawBlockHeader(doc, margin, y, contentW, "Risk Management & Security Package");
  autoTable(doc, {
    startY: y + 5,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: { fontSize: 7.5, cellPadding: 1.2 },
    columnStyles: {
      0: { cellWidth: 60 }, 1: { halign: "center", cellWidth: 18, fontStyle: "bold" },
      2: { cellWidth: 60 }, 3: { halign: "center", cellWidth: 18, fontStyle: "bold" },
      4: { cellWidth: 60 }, 5: { halign: "center", cellWidth: 18, fontStyle: "bold" },
    },
    body: [
      ["First ranking mortgage", { content: "OK", styles: { fillColor: GREEN_OK, textColor: NAVY } },
       "Pledge over shares", { content: "OK", styles: { fillColor: GREEN_OK, textColor: NAVY } },
       "Pledge over sponsor shares", { content: "OK", styles: { fillColor: GREEN_OK, textColor: NAVY } }],
      ["Pledge bank accounts", { content: "OK", styles: { fillColor: GREEN_OK, textColor: NAVY } },
       "Lender as insurance beneficiary", { content: "OK", styles: { fillColor: GREEN_OK, textColor: NAVY } },
       "Ability to sale the property", { content: "OK", styles: { fillColor: GREEN_OK, textColor: NAVY } }],
      ["Equity contribution undertaking", { content: "No", styles: { fillColor: PINK_SOFT, textColor: PINK } },
       "Step-in rights", { content: "OK", styles: { fillColor: GREEN_OK, textColor: NAVY } },
       "", ""],
    ],
  });

  drawPageFooter(doc, 2, pageW, pageH);

  // Save
  const safe = deal.projectName.replace(/[^a-zA-Z0-9-]/g, "_");
  doc.save(`ICMemo_${safe}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ------ Helpers ------

function drawHeader(doc: jsPDF, deal: Deal, pageW: number): void {
  // Dark navy band
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 34, "F");

  // Clikalia-style brand text (we have no logo asset — draw typographic)
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("capitalbridge", 10, 15);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(200, 210, 215);
  doc.text("Lending Platform — " + deal.projectName, 10, 21);

  // Project name badge
  doc.setFillColor(...TEAL);
  doc.roundedRect(80, 7, 70, 20, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(deal.projectName, 115, 19, { align: "center", maxWidth: 66 });

  // KPIs right side
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 210, 215);
  doc.text("Debt Amount", 170, 10);
  doc.text("Total Investment", 170, 16);
  doc.text("Appraisal Value*", 170, 22);

  doc.setFillColor(...PINK_SOFT);
  doc.roundedRect(200, 7, 45, 5, 1, 1, "F");
  doc.roundedRect(200, 13, 45, 5, 1, 1, "F");
  doc.roundedRect(200, 19, 45, 5, 1, 1, "F");
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(fmtCurrency(deal.loanAmount), 243, 11, { align: "right" });
  doc.text(fmtCurrency(deal.constructionBudget + deal.landCost), 243, 17, { align: "right" });
  doc.text(fmtCurrency(deal.currentAppraisal || deal.gdv * 0.7), 243, 23, { align: "right" });

  // LTC / LTV
  doc.setTextColor(200, 210, 215);
  doc.setFont("helvetica", "normal");
  doc.text("LTC", 252, 10);
  doc.text("LTV", 252, 16);
  doc.setFillColor(...PINK_SOFT);
  doc.roundedRect(260, 7, 18, 5, 1, 1, "F");
  doc.roundedRect(260, 13, 18, 5, 1, 1, "F");
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.text(fmtPct(deal.ltc), 276, 11, { align: "right" });
  doc.text(fmtPct(deal.ltv), 276, 17, { align: "right" });
}

function drawSectionBar(doc: jsPDF, x: number, y: number, w: number, title: string): void {
  doc.setFillColor(...TEAL);
  doc.rect(x, y, w, 5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(title, x + 2, y + 3.5);
}

function drawBlockHeader(doc: jsPDF, x: number, y: number, w: number, title: string): void {
  doc.setFillColor(...CELL);
  doc.rect(x, y, w, 4, "F");
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(title, x + 1.5, y + 2.8);
}

function drawPageFooter(doc: jsPDF, pageNum: number, pageW: number, pageH: number): void {
  doc.setDrawColor(...CELL);
  doc.setLineWidth(0.3);
  doc.line(6, pageH - 6, pageW - 6, pageH - 6);
  doc.setTextColor(...MUTED);
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.text("CapitalBridge — Lending Platform · Confidential", 6, pageH - 3);
  doc.text(`Page ${pageNum}`, pageW - 6, pageH - 3, { align: "right" });
}

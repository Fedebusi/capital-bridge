import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Deal } from "@/data/sampleDeals";

export function generateTaxReport(deals: Deal[]) {
  const doc = new jsPDF();
  const activeDeals = deals.filter(d => d.stage === "active" || d.stage === "repaid");
  const now = new Date();
  const year = now.getFullYear() - 1; // Report for previous fiscal year

  // ===== HEADER =====
  doc.setFillColor(25, 33, 46);
  doc.rect(0, 0, 210, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("CapitalBridge", 15, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Investor Tax Report", 15, 26);
  doc.text(`Fiscal Year ${year}`, 15, 33);

  doc.setFontSize(8);
  doc.text(`Generated: ${now.toLocaleDateString("en-GB")}`, 150, 33);
  doc.text("CONFIDENTIAL", 150, 18);

  // ===== FUND INFO =====
  doc.setTextColor(25, 33, 46);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Fund Information", 15, 52);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const fundInfo = [
    ["Fund Name", "Global Debt Fund I"],
    ["Fund Manager", "CapitalBridge Asset Management"],
    ["Jurisdiction", "Spain"],
    ["Fund Type", "Closed-End Institutional Debt Fund"],
    ["Reporting Period", `01 January ${year} — 31 December ${year}`],
    ["Currency", "EUR"],
  ];

  autoTable(doc, {
    startY: 56,
    body: fundInfo,
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 55 },
      1: { cellWidth: 120 },
    },
    margin: { left: 15 },
  });

  // ===== INCOME SUMMARY =====
  const totalInterest = activeDeals.reduce((s, d) => {
    const monthlyRate = d.interestRate / 100 / 12;
    return s + (d.outstandingPrincipal * monthlyRate * 12);
  }, 0);

  const totalPIK = activeDeals.reduce((s, d) => s + d.accruedPIK, 0);
  const totalFees = activeDeals.reduce((s, d) => s + (d.loanAmount * d.originationFee / 100), 0);
  const totalIncome = totalInterest + totalPIK + totalFees;

  let currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Income Summary", 15, currentY);
  currentY += 4;

  autoTable(doc, {
    startY: currentY,
    head: [["Category", "Amount (EUR)", "Tax Treatment"]],
    body: [
      ["Cash Interest Income", formatEUR(totalInterest), "Ordinary income — subject to withholding"],
      ["PIK Interest Accrued", formatEUR(totalPIK), "Accrued income — taxable on capitalization"],
      ["Origination Fees", formatEUR(totalFees), "Fee income — taxable in period earned"],
      ["Exit Fees (realized)", formatEUR(0), "Fee income — taxable on realization"],
      ["", "", ""],
      ["Total Gross Income", formatEUR(totalIncome), ""],
    ],
    theme: "striped",
    styles: { fontSize: 8.5, cellPadding: 3 },
    headStyles: { fillColor: [25, 33, 46], textColor: 255, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 40, halign: "right" },
      2: { cellWidth: 85, fontStyle: "italic", textColor: [100, 116, 139] },
    },
    margin: { left: 15 },
  });

  // ===== PORTFOLIO POSITIONS =====
  currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Portfolio Positions", 15, currentY);
  currentY += 4;

  const positionRows = activeDeals.map(d => [
    d.projectName,
    d.stage === "repaid" ? "Repaid" : "Active",
    formatEUR(d.loanAmount),
    formatEUR(d.outstandingPrincipal),
    `${d.totalRate.toFixed(1)}%`,
    formatEUR(d.accruedPIK),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [["Deal", "Status", "Facility", "Outstanding", "Rate", "Accrued PIK"]],
    body: positionRows,
    theme: "striped",
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [25, 33, 46], textColor: 255, fontStyle: "bold" },
    columnStyles: {
      1: { cellWidth: 18 },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "center" },
      5: { halign: "right" },
    },
    margin: { left: 15 },
  });

  // ===== WITHHOLDING TAX =====
  currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Withholding Tax Summary", 15, currentY);
  currentY += 4;

  const withholdingRate = 19; // Spain standard rate
  const withholdingAmount = totalInterest * withholdingRate / 100;

  autoTable(doc, {
    startY: currentY,
    body: [
      ["Gross Interest Income", formatEUR(totalInterest)],
      [`Withholding Tax Rate (Spain)`, `${withholdingRate}%`],
      ["Withholding Tax Deducted", formatEUR(withholdingAmount)],
      ["Net Interest After Withholding", formatEUR(totalInterest - withholdingAmount)],
    ],
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 70 },
      1: { cellWidth: 40, halign: "right" },
    },
    margin: { left: 15 },
  });

  // ===== DISCLAIMER =====
  currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  doc.setDrawColor(200, 200, 200);
  doc.line(15, currentY, 195, currentY);
  currentY += 6;

  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(120, 120, 120);

  const disclaimer = [
    "DISCLAIMER: This document is provided for informational purposes only and does not constitute tax advice.",
    "Investors should consult their own tax advisors regarding the tax implications of their investment.",
    "The tax treatment described herein is based on current Spanish tax law and may be subject to change.",
    "CapitalBridge Asset Management accepts no liability for any tax consequences arising from the use of this report.",
  ];
  disclaimer.forEach((line, i) => {
    doc.text(line, 15, currentY + (i * 4));
  });

  // ===== SAVE =====
  doc.save(`CapitalBridge_Tax_Report_FY${year}.pdf`);
}

function formatEUR(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

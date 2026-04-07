import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Deal } from "@/data/sampleDeals";
import type { TermSheet } from "@/data/termSheetData";

export function generateTermSheetPDF(deal: Deal, ts: TermSheet) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = 20;

  const addLine = () => { doc.setDrawColor(200, 200, 200); doc.line(margin, y, pageW - margin, y); y += 5; };
  const addSpace = (n = 5) => { y += n; };
  const checkPage = (needed = 30) => { if (y + needed > 270) { doc.addPage(); y = 20; } };

  // ============ HEADER ============
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("CONFIDENTIAL", pageW - margin, y, { align: "right" });

  doc.setFontSize(22);
  doc.setTextColor(25, 33, 46);
  y += 12;
  doc.text("TERM SHEET", margin, y);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  y += 7;
  doc.text("Indicative Terms and Conditions", margin, y);

  y += 3;
  addLine();
  addSpace(3);

  // ============ PARTIES ============
  doc.setFontSize(11);
  doc.setTextColor(25, 33, 46);
  doc.setFont("helvetica", "bold");
  doc.text("1. PARTIES", margin, y);
  y += 7;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 3, textColor: [25, 33, 46] },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 45, textColor: [100, 116, 139] } },
    body: [
      ["Lender", "CapitalBridge Fund I, S.C.A. SICAV-SIF"],
      ["Borrower", deal.borrower],
      ["Sponsor / Guarantor", deal.sponsor],
      ["Project Company (SPV)", `${deal.projectName} S.L.`],
      ["Project", deal.projectName],
      ["Location", deal.location],
      ["Asset Type", deal.assetType],
    ],
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // ============ FACILITY ============
  checkPage(60);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("2. FACILITY", margin, y);
  y += 7;

  const kt = ts.keyTerms;
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 3, textColor: [25, 33, 46] },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 55, textColor: [100, 116, 139] } },
    body: [
      ["Facility Amount", `€${kt.facility.toLocaleString("es-ES")}`],
      ["Currency", "EUR"],
      ["Purpose", "To fund the acquisition, development, and construction costs of the Project"],
      ["Availability Period", `${kt.tenor} months from the date of signing`],
      ["Tenor", `${kt.tenor} months`],
      ["Repayment", "Bullet repayment at maturity. Voluntary prepayment permitted with 30 days notice."],
    ],
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // ============ PRICING ============
  checkPage(60);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("3. PRICING", margin, y);
  y += 7;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 3, textColor: [25, 33, 46] },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 55, textColor: [100, 116, 139] } },
    body: [
      ["Cash Interest Rate", `${kt.cashRate}% per annum, payable monthly in arrears`],
      ["PIK Interest", `${kt.pikSpread}% per annum, capitalised monthly to the outstanding principal`],
      ["Total Interest Rate", `${kt.cashRate + kt.pikSpread}% per annum`],
      ["Origination Fee", `${kt.originationFee}% of the Facility Amount (€${Math.round(kt.facility * kt.originationFee / 100).toLocaleString("es-ES")}), payable at first drawdown`],
      ["Exit Fee", `${kt.exitFee}% of the Facility Amount (€${Math.round(kt.facility * kt.exitFee / 100).toLocaleString("es-ES")}), payable at repayment`],
      ["Default Interest", "Additional 2.0% per annum on overdue amounts"],
    ],
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // ============ FINANCIAL COVENANTS ============
  checkPage(50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("4. FINANCIAL COVENANTS", margin, y);
  y += 7;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 3, textColor: [25, 33, 46] },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 55, textColor: [100, 116, 139] } },
    body: [
      ["Maximum LTV", `${kt.ltv}% at all times, tested quarterly based on latest independent valuation`],
      ["Maximum LTC", `${kt.ltc}% at all times, tested quarterly based on certified construction costs`],
      ["Minimum Pre-Sales", `${kt.minPresales}% of total units must be pre-sold (contracted or reserved) before third drawdown`],
      ["Cost Overrun Reserve", "Borrower to maintain a reserve of 10% of remaining construction budget"],
      ["Interest Reserve", "3 months of cash interest to be deposited in a pledged account at first drawdown"],
      ["Information Covenant", "Monthly construction reports, quarterly financial statements, annual audited accounts"],
    ],
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // ============ SECURITY PACKAGE ============
  checkPage(50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("5. SECURITY PACKAGE", margin, y);
  y += 7;

  const securityBody = kt.securityPackage.map((item, i) => [`${i + 1}.`, item]);
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 3, textColor: [25, 33, 46] },
    columnStyles: { 0: { cellWidth: 10, textColor: [100, 116, 139] } },
    body: securityBody,
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // ============ CONDITIONS PRECEDENT ============
  checkPage(60);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("6. CONDITIONS PRECEDENT TO FIRST DRAWDOWN", margin, y);
  y += 7;

  const cpItems = [
    "Execution of all Finance Documents (Facility Agreement, Security Documents, Intercreditor Agreement)",
    "Satisfactory completion of legal, technical, and environmental due diligence",
    "Delivery of building permits and all necessary planning approvals",
    "Evidence of equity contribution by the Sponsor (minimum 25% of total project cost)",
    `Pre-sales evidence: minimum ${kt.minPresales}% of units pre-sold`,
    "Appointment of an independent monitoring surveyor approved by the Lender",
    "Insurance policies in place (CAR, third party liability, professional indemnity)",
    "Opening and pledging of all project accounts",
    "Delivery of corporate authorisations and legal opinions",
    "Payment of the Origination Fee",
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 3, textColor: [25, 33, 46] },
    columnStyles: { 0: { cellWidth: 10, textColor: [100, 116, 139] } },
    body: cpItems.map((item, i) => [`${i + 1}.`, item]),
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // ============ DRAWDOWN MECHANICS ============
  checkPage(40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("7. DRAWDOWN MECHANICS", margin, y);
  y += 7;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 3, textColor: [25, 33, 46] },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 55, textColor: [100, 116, 139] } },
    body: [
      ["Drawdown Notice", "Minimum 10 business days prior written notice"],
      ["Minimum Amount", "€500,000 per drawdown"],
      ["Certification", "Each drawdown subject to independent surveyor certification of construction progress"],
      ["Retention", "10% of each drawdown retained until practical completion"],
      ["Frequency", "Monthly drawdowns permitted, aligned with construction milestones"],
    ],
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // ============ EVENTS OF DEFAULT ============
  checkPage(50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("8. EVENTS OF DEFAULT", margin, y);
  y += 7;

  const defaults = [
    "Non-payment of any amount due under the Finance Documents",
    "Breach of any Financial Covenant not remedied within 15 business days",
    "Material adverse change in the financial condition of the Borrower or Sponsor",
    "Insolvency, liquidation, or administration of the Borrower, SPV, or Sponsor",
    "Cross-default under any other financial indebtedness exceeding €100,000",
    "Any Security becomes invalid or unenforceable",
    "Construction delay exceeding 6 months beyond the agreed programme",
    "Any material misrepresentation in information provided to the Lender",
    "Change of control of the Borrower or SPV without prior consent",
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 3, textColor: [25, 33, 46] },
    columnStyles: { 0: { cellWidth: 10, textColor: [100, 116, 139] } },
    body: defaults.map((item, i) => [`${i + 1}.`, item]),
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // ============ GENERAL ============
  checkPage(50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("9. GENERAL PROVISIONS", margin, y);
  y += 7;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 3, textColor: [25, 33, 46] },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 55, textColor: [100, 116, 139] } },
    body: [
      ["Governing Law", "Laws of Spain"],
      ["Jurisdiction", "Courts of Madrid"],
      ["Exclusivity", ts.exclusivityEnd ? `This Term Sheet is subject to an exclusivity period ending ${ts.exclusivityEnd}` : "30 days from the date of signature"],
      ["Confidentiality", "This document and its contents are strictly confidential"],
      ["Non-Binding", "This Term Sheet is indicative and non-binding, except for the Exclusivity, Confidentiality, and Governing Law clauses"],
      ["Costs", "Each party bears its own costs. The Borrower shall reimburse the Lender's legal and due diligence costs up to €50,000"],
    ],
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  // ============ SIGNATURE BLOCKS ============
  checkPage(60);
  addLine();
  addSpace(10);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("SIGNATURE", margin, y);
  y += 10;

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);

  // Lender
  doc.text("For and on behalf of the LENDER:", margin, y);
  y += 15;
  doc.setDrawColor(25, 33, 46);
  doc.line(margin, y, margin + 60, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.text("CapitalBridge Fund I, S.C.A. SICAV-SIF", margin, y);
  y += 4;
  doc.text("Name:", margin, y);
  y += 4;
  doc.text("Title:", margin, y);
  y += 4;
  doc.text("Date:", margin, y);

  // Borrower
  const rightX = pageW / 2 + 10;
  let yRight = y - 27;
  doc.setFont("helvetica", "bold");
  doc.text("For and on behalf of the BORROWER:", rightX, yRight);
  yRight += 15;
  doc.line(rightX, yRight, rightX + 60, yRight);
  yRight += 5;
  doc.setFont("helvetica", "normal");
  doc.text(deal.borrower, rightX, yRight);
  yRight += 4;
  doc.text("Name:", rightX, yRight);
  yRight += 4;
  doc.text("Title:", rightX, yRight);
  yRight += 4;
  doc.text("Date:", rightX, yRight);

  // ============ FOOTER ON ALL PAGES ============
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.text(`CapitalBridge — ${deal.projectName} — Term Sheet v${ts.currentVersion}`, margin, 290);
    doc.text(`Page ${i} of ${totalPages}`, pageW - margin, 290, { align: "right" });
    doc.text("CONFIDENTIAL — FOR DISCUSSION PURPOSES ONLY", pageW / 2, 290, { align: "center" });
  }

  doc.save(`TermSheet_${deal.projectName.replace(/\s+/g, "_")}_v${ts.currentVersion}.pdf`);
}

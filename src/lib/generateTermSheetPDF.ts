import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Deal } from "@/data/sampleDeals";
import type { TermSheet } from "@/data/termSheetData";

export function generateTermSheetPDF(deal: Deal, ts: TermSheet) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 18;
  let y = 15;

  const kt = ts.keyTerms;
  const totalRate = kt.cashRate + kt.pikSpread;

  // Colors
  const navy = [25, 33, 46] as [number, number, number];
  const headerBg = [41, 65, 122] as [number, number, number];
  const sectionBg = [226, 232, 240] as [number, number, number]; // slate-200
  const white = [255, 255, 255] as [number, number, number];
  const black = [15, 23, 42] as [number, number, number];

  // ============ TITLE ============
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...navy);
  doc.text("TERM SHEET", margin, y);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("CONFIDENTIAL", pageW - margin, y, { align: "right" });

  y += 4;
  doc.setDrawColor(...navy);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  doc.setFontSize(10);
  doc.setTextColor(...navy);
  doc.setFont("helvetica", "bold");
  doc.text(deal.projectName.toUpperCase(), margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  y += 5;
  doc.text(`${deal.borrower} — ${deal.location}`, margin, y);
  y += 4;
  doc.text(`Version ${ts.currentVersion} — ${ts.signedDate || ts.issuedDate || "Draft"}`, margin, y);
  y += 8;

  // Helper to add a section with term-sheet table style
  const addSection = (title: string, rows: [string, string][]) => {
    // Check if we need a new page
    const estimatedHeight = 8 + rows.length * 10;
    if (y + estimatedHeight > 270) { doc.addPage(); y = 15; }

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "grid",
      styles: {
        fontSize: 8.5,
        cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
        lineColor: [41, 65, 122],
        lineWidth: 0.3,
        textColor: black,
        font: "helvetica",
      },
      headStyles: {
        fillColor: headerBg,
        textColor: white,
        fontStyle: "bold",
        fontSize: 9,
        cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: "bold", textColor: navy },
        1: { cellWidth: undefined },
      },
      head: [[title, ""]],
      body: rows.map(([label, value]) => {
        // Check if this is a sub-section header (empty value)
        return [label, value];
      }),
      didParseCell: (data: { row: { index: number }; section: string; column: { index: number }; cell: { styles: { fillColor: number[]; fontStyle: string; textColor: number[] } } }) => {
        if (data.section === "body") {
          const rowData = rows[data.row.index];
          // If value is empty, it's a sub-section header
          if (rowData && rowData[1] === "") {
            data.cell.styles.fillColor = [...sectionBg];
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.textColor = [...navy];
          }
        }
      },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
  };

  // ============ SECTION 1: PARTIES ============
  addSection("PARTIES", [
    ["Lender", "CapitalBridge Fund I, S.C.A. SICAV-SIF (the \"Senior Lender\")"],
    ["Borrower", `${deal.borrower} (the \"Borrower\")`],
    ["Sponsor / Guarantor", deal.sponsor],
    ["Project Company (SPV)", `${deal.projectName} S.L.`],
    ["Project", `${deal.projectName} — ${deal.description.substring(0, 120)}...`],
    ["Location", deal.location],
    ["Asset Type", deal.assetType],
  ]);

  // ============ SECTION 2: SENIOR FACILITY TERMS ============
  addSection("SENIOR FACILITY TERMS", [
    ["Senior Facility Terms", ""],
    ["Senior Secured Facility\nCommitment Amount", `€${kt.facility.toLocaleString("es-ES")}`],
    ["Purpose", "To provide funding to the Borrower so that the Borrower can fund the acquisition, development, and construction costs of the Project, and pay the Senior Lender's interest, the Servicing Fee and the Origination Fee."],
    ["Currency", "EUR"],
    ["Availability Period", `${kt.tenor} months from the date of the Facility Agreement`],
    ["Tenor", `${kt.tenor} months from first drawdown`],
    ["Repayment", "Bullet repayment at maturity. Voluntary prepayment permitted with 30 calendar days prior written notice. No prepayment penalty."],
  ]);

  // ============ SECTION 3: INTEREST & FEES ============
  addSection("INTEREST AND FEES", [
    ["Interest Rate", `${totalRate}% per annum, comprised of:\n• Cash Interest: ${kt.cashRate}% p.a., payable monthly in arrears\n• PIK Interest: ${kt.pikSpread}% p.a., capitalised monthly to outstanding principal`],
    ["Senior Secured Facility\nInterest Rate", `${totalRate}%\nInterest shall be paid to the Senior Lender in accordance with the \"Payment of Interest\" paragraph above.`],
    ["Default Interest", "Additional 2.0% per annum on all overdue amounts, payable on demand"],
    ["Origination Fee", `${kt.originationFee}% of the Facility Amount (€${Math.round(kt.facility * kt.originationFee / 100).toLocaleString("es-ES")}), payable at first drawdown`],
    ["Exit Fee", `${kt.exitFee}% of the Facility Amount (€${Math.round(kt.facility * kt.exitFee / 100).toLocaleString("es-ES")}), payable upon repayment or maturity`],
    ["Servicing Fee", "0.25% per annum on outstanding principal, payable quarterly in arrears"],
  ]);

  // ============ SECTION 4: FINANCIAL COVENANTS ============
  addSection("FINANCIAL COVENANTS", [
    ["Maximum LTV", `${kt.ltv}% at all times. Tested quarterly based on the latest independent valuation ordered by the Lender. Breach triggers a cure period of 30 business days.`],
    ["Maximum LTC", `${kt.ltc}% at all times. Tested quarterly based on certified construction costs and land acquisition cost.`],
    ["Minimum Pre-Sales", `${kt.minPresales}% of total units must be pre-sold (contracted or reserved with deposit) before the third drawdown.`],
    ["Cost Overrun Reserve", "The Borrower shall maintain a cost overrun reserve equivalent to 10% of the remaining construction budget in a pledged account."],
    ["Interest Service Reserve", "3 months of projected cash interest payments to be deposited at first drawdown in a pledged account."],
    ["Information Covenant", "The Borrower shall provide:\n• Monthly construction progress reports\n• Quarterly unaudited financial statements\n• Annual audited financial statements\n• Immediate notice of any material adverse event"],
  ]);

  // ============ SECTION 5: SECURITY PACKAGE ============
  const securityRows: [string, string][] = [
    ["Senior Lender and Junior\nSecurity", "First-rank (senior lender) and second rank (junior lender) charges on all Loans, receivables, claims, and bank accounts of the Borrower."],
  ];
  kt.securityPackage.forEach((item, i) => {
    securityRows.push([`Security ${i + 1}`, item]);
  });
  addSection("SECURITY PACKAGE", securityRows);

  // ============ SECTION 6: CONDITIONS PRECEDENT ============
  addSection("CONDITIONS PRECEDENT TO FIRST DRAWDOWN", [
    ["Finance Documents", "Execution of the Facility Agreement, Security Documents, Intercreditor Agreement, and all ancillary documents."],
    ["Due Diligence", "Satisfactory completion of legal, technical, environmental, and commercial due diligence by advisors appointed by the Lender."],
    ["Planning & Permits", "Delivery of valid building permits and all necessary planning approvals for the full scope of the Project."],
    ["Equity Contribution", "Evidence that the Sponsor has contributed equity of at least 25% of the total project cost."],
    ["Pre-Sales", `Evidence of pre-sales of at least ${kt.minPresales}% of total units.`],
    ["Monitoring Surveyor", "Appointment of an independent monitoring surveyor approved by the Lender."],
    ["Insurance", "All required insurance policies in place: Construction All Risk (CAR), third-party liability, professional indemnity."],
    ["Accounts", "Opening and pledging of all project accounts (Funding Account, Collections Account, Liquidity Reserve Account)."],
    ["Corporate Authorisations", "Delivery of all corporate authorisations, board resolutions, and legal opinions."],
    ["Origination Fee", `Payment of the Origination Fee of €${Math.round(kt.facility * kt.originationFee / 100).toLocaleString("es-ES")}.`],
  ]);

  // ============ SECTION 7: DRAWDOWN MECHANICS ============
  addSection("DRAWDOWN MECHANICS", [
    ["Drawdown Notice", "Minimum 10 business days prior written notice to the Lender."],
    ["Minimum Drawdown", "€500,000 per drawdown request."],
    ["Certification", "Each drawdown is subject to prior certification by the independent monitoring surveyor confirming construction progress."],
    ["Retention", "10% of each drawdown amount shall be retained until practical completion of the relevant construction milestone."],
    ["Frequency", "Monthly drawdowns permitted, aligned with the agreed construction milestone schedule."],
    ["Accounts", "Accounts structure:\n1. Funding Account — pre-funded by the Senior Lender, used to fund expenses and drawdowns\n2. Collections Account\n3. Liquidity Reserve Account"],
  ]);

  // ============ SECTION 8: EVENTS OF DEFAULT ============
  addSection("EVENTS OF DEFAULT", [
    ["Senior Secured Facility Event\nof Default", "Customary events of default for this kind of financing, including but not limited to:\n• Borrowing Base Breach, not cured within [30] business days\n• Non-payment\n• Breach of representations & warranties"],
    ["Cross-Default", "Default under any other financial indebtedness of the Borrower, SPV, or Sponsor exceeding €100,000."],
    ["Insolvency", "Insolvency, liquidation, administration, or any analogous proceeding of the Borrower, SPV, or Sponsor."],
    ["Material Adverse Change", "Any event which in the reasonable opinion of the Lender has a material adverse effect on the Borrower's ability to perform its obligations."],
    ["Construction Delay", "Construction delay exceeding 6 months beyond the agreed programme without reasonable justification."],
    ["Change of Control", "Any change of control of the Borrower or SPV without the prior written consent of the Lender."],
    ["Servicer Termination Right", "The Borrower has the right to terminate the relationship with the Servicer upon the occurrence of a Senior Secured Facility Event of Default, change of control of the Servicer, or default by the Servicer."],
  ]);

  // ============ SECTION 9: OTHER TERMS ============
  addSection("OTHER TERMS", [
    ["Governing Law", "Laws of Spain"],
    ["Jurisdiction", "Courts of Madrid"],
    ["Exclusivity", ts.exclusivityEnd ? `This Term Sheet is subject to an exclusivity period ending ${ts.exclusivityEnd}. During this period, the Borrower shall not solicit or negotiate alternative financing.` : "30 calendar days from the date of execution of this Term Sheet."],
    ["Confidentiality", "This document and its contents are strictly confidential and may not be disclosed to any third party without the prior written consent of both parties."],
    ["Non-Binding Nature", "This Term Sheet is indicative and non-binding, except for the Exclusivity, Confidentiality, Governing Law, and Costs clauses which are binding."],
    ["Costs", "Each party shall bear its own costs. The Borrower shall reimburse the Lender's external legal, technical, and due diligence costs up to a maximum of €50,000."],
  ]);

  // ============ SIGNATURE BLOCKS ============
  if (y + 60 > 270) { doc.addPage(); y = 15; }
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...navy);
  doc.text("AGREED AND ACCEPTED", margin, y);
  y += 10;

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);

  // Lender block
  doc.setFont("helvetica", "bold");
  doc.text("For and on behalf of the LENDER:", margin, y);
  y += 12;
  doc.setDrawColor(...navy);
  doc.setLineWidth(0.4);
  doc.line(margin, y, margin + 65, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...black);
  doc.text("CapitalBridge Fund I, S.C.A. SICAV-SIF", margin, y);
  y += 4; doc.text("Name: ________________________________", margin, y);
  y += 4; doc.text("Title: _________________________________", margin, y);
  y += 4; doc.text("Date: _________________________________", margin, y);

  // Borrower block
  const rightX = pageW / 2 + 5;
  let yR = y - 29;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("For and on behalf of the BORROWER:", rightX, yR);
  yR += 12;
  doc.line(rightX, yR, rightX + 65, yR);
  yR += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...black);
  doc.text(deal.borrower, rightX, yR);
  yR += 4; doc.text("Name: ________________________________", rightX, yR);
  yR += 4; doc.text("Title: _________________________________", rightX, yR);
  yR += 4; doc.text("Date: _________________________________", rightX, yR);

  // ============ FOOTER ON ALL PAGES ============
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.text(`CapitalBridge — ${deal.projectName} — Term Sheet v${ts.currentVersion}`, margin, 290);
    doc.text(`Page ${i} of ${totalPages}`, pageW - margin, 290, { align: "right" });
    doc.setFontSize(6.5);
    doc.text("CONFIDENTIAL — FOR DISCUSSION PURPOSES ONLY", pageW / 2, 290, { align: "center" });
  }

  doc.save(`TermSheet_${deal.projectName.replace(/\s+/g, "_")}_v${ts.currentVersion}.pdf`);
}

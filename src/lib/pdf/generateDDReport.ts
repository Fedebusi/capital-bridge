import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { type DDItem, ddCategoryLabels, type DDCategory } from "@/data/dealModules";
import { type Deal, formatMillions, formatPercent } from "@/data/sampleDeals";

const STATUS_LABELS: Record<string, string> = {
  completed: "Completed",
  in_progress: "In Progress",
  pending: "Pending",
  flagged: "Flagged",
  not_applicable: "N/A",
};

const STATUS_COLORS: Record<string, [number, number, number]> = {
  completed: [16, 185, 129],
  in_progress: [59, 130, 246],
  pending: [156, 163, 175],
  flagged: [239, 68, 68],
  not_applicable: [156, 163, 175],
};

export function generateDDReport(deal: Deal, items: DDItem[]) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = margin;

  // ===== HEADER =====
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageW, 44, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("CAPITALBRIDGE", margin, 14);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Due Diligence Report", margin, 26);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(deal.projectName, margin, 35);
  doc.text(new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }), pageW - margin, 35, { align: "right" });

  y = 54;

  // ===== DEAL SUMMARY =====
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Deal Overview", margin, y);
  y += 7;

  const summaryData = [
    ["Borrower", deal.borrower],
    ["Sponsor", deal.sponsor],
    ["Location", deal.location],
    ["Asset Type", deal.assetType],
    ["Loan Amount", formatMillions(deal.loanAmount)],
    ["LTV / LTC", `${formatPercent(deal.ltv)} / ${formatPercent(deal.ltc)}`],
    ["GDV", formatMillions(deal.gdv)],
    ["Pre-Sales", formatPercent(deal.preSalesPercent)],
  ];

  autoTable(doc, {
    startY: y,
    head: [],
    body: summaryData,
    theme: "plain",
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 40, textColor: [100, 116, 139] },
      1: { textColor: [15, 23, 42] },
    },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // ===== OVERALL STATUS =====
  const total = items.length;
  const completed = items.filter(i => i.status === "completed").length;
  const flagged = items.filter(i => i.status === "flagged").length;
  const inProgress = items.filter(i => i.status === "in_progress").length;
  const pending = items.filter(i => i.status === "pending").length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Overall Progress", margin, y);
  y += 7;

  // Progress bar
  const barH = 6;
  doc.setFillColor(226, 232, 240);
  doc.roundedRect(margin, y, contentW, barH, 2, 2, "F");
  if (pct > 0) {
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(margin, y, contentW * (pct / 100), barH, 2, 2, "F");
  }
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  if (pct > 15) {
    doc.text(`${pct}%`, margin + contentW * (pct / 100) / 2, y + 4.5, { align: "center" });
  }
  y += barH + 5;

  // Stats row
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  const stats = [
    `Total: ${total}`,
    `Completed: ${completed}`,
    `In Progress: ${inProgress}`,
    `Pending: ${pending}`,
    `Flagged: ${flagged}`,
  ];
  doc.text(stats.join("   |   "), margin, y);
  y += 10;

  // ===== DD BY CATEGORY =====
  const categories: DDCategory[] = ["technical", "commercial", "legal", "financial", "environmental", "appraisal"];

  for (const cat of categories) {
    const catItems = items.filter(i => i.category === cat);
    if (catItems.length === 0) continue;

    // Check if we need a new page
    if (y > 240) {
      doc.addPage();
      y = margin;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(ddCategoryLabels[cat], margin, y);

    const catCompleted = catItems.filter(i => i.status === "completed").length;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`${catCompleted}/${catItems.length} completed`, pageW - margin, y, { align: "right" });
    y += 5;

    const tableBody = catItems.map(item => [
      item.label,
      STATUS_LABELS[item.status] || item.status,
      item.assignee || "—",
      item.completedDate || item.dueDate || "—",
      item.notes || "",
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Item", "Status", "Assignee", "Date", "Notes"]],
      body: tableBody,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 2.5, overflow: "linebreak" },
      headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: "bold", fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 22 },
        2: { cellWidth: 30 },
        3: { cellWidth: 22 },
        4: { cellWidth: contentW - 50 - 22 - 30 - 22 },
      },
      didParseCell: (data: { column: { index: number }; section: string; row: { index: number }; cell: { styles: { textColor: number[]; fontStyle: string } } }) => {
        if (data.column.index === 1 && data.section === "body") {
          const status = catItems[data.row.index]?.status;
          if (status && STATUS_COLORS[status]) {
            data.cell.styles.textColor = STATUS_COLORS[status];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

    // Documents sub-section
    const docsItems = catItems.filter(i => i.documents && i.documents.length > 0);
    if (docsItems.length > 0) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 116, 139);
      doc.text("Evidence / Documents:", margin + 2, y);
      y += 4;
      for (const item of docsItems) {
        for (const d of item.documents ?? []) {
          doc.setFont("helvetica", "normal");
          doc.text(`• ${d.name} (v${d.version}, ${d.uploadDate})`, margin + 4, y);
          y += 4;
        }
      }
      y += 4;
    }
  }

  // ===== FLAGGED ITEMS SUMMARY =====
  const flaggedItems = items.filter(i => i.status === "flagged");
  if (flaggedItems.length > 0) {
    if (y > 240) {
      doc.addPage();
      y = margin;
    }

    doc.setFillColor(254, 242, 242);
    doc.roundedRect(margin, y - 2, contentW, 8, 2, 2, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 38, 38);
    doc.text(`⚠ Flagged Items (${flaggedItems.length})`, margin + 3, y + 4);
    y += 12;

    for (const item of flaggedItems) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(`${ddCategoryLabels[item.category]} — ${item.label}`, margin, y);
      y += 4;
      if (item.notes) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(item.notes, margin + 2, y);
        y += 4;
      }
      if (item.assignee) {
        doc.text(`Assigned to: ${item.assignee}`, margin + 2, y);
        y += 4;
      }
      y += 2;
    }
  }

  // ===== FOOTER on every page =====
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(156, 163, 175);
    doc.text("CapitalBridge — Confidential", margin, pageH - 8);
    doc.text(`Page ${i} of ${totalPages}`, pageW - margin, pageH - 8, { align: "right" });
  }

  // Save
  doc.save(`DD_Report_${deal.projectName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

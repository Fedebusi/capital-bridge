import * as XLSX from "xlsx";
import type { Deal } from "@/data/sampleDeals";

/**
 * Loads the UW_v2 template from /public and writes deal-specific values into
 * Cover + Inputs, then triggers a browser download. Formulas in the template
 * propagate automatically when the user opens the file in Excel.
 */
export async function downloadUWForDeal(deal: Deal): Promise<void> {
  // Fetch the template
  const res = await fetch("/templates/UW_v2.xlsx");
  if (!res.ok) throw new Error(`Could not load UW template: ${res.status}`);
  const buf = await res.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellFormula: true });

  // ===== Cover sheet — Deal identification =====
  const cover = wb.Sheets["Cover"];
  if (cover) {
    // Info block
    cover["C6"] = { t: "s", v: deal.projectName };
    cover["C7"] = { t: "s", v: deal.sponsor };
    cover["C8"] = { t: "s", v: deal.borrower };
    cover["C9"] = { t: "s", v: `${deal.location}, ${deal.city}` };
    cover["C10"] = { t: "s", v: deal.assetType };
    cover["C11"] = { t: "n", v: deal.totalArea };
    cover["C12"] = { t: "n", v: deal.totalUnits };
    // Deal date stays as TODAY() formula
    cover["C15"] = { t: "s", v: "CapitalBridge" };
  }

  // ===== Inputs sheet — populate the key inputs =====
  const inputs = wb.Sheets["Inputs"];
  if (inputs) {
    // Sales plan
    inputs["C15"] = { t: "n", v: deal.totalArea };
    inputs["C16"] = { t: "n", v: deal.totalUnits };
    if (deal.totalArea > 0) {
      inputs["C17"] = { t: "n", v: deal.gdv / deal.totalArea };
    }

    // Costs
    if (deal.totalArea > 0) {
      // Hard costs €/sqm — estimate from construction budget
      inputs["D28"] = { t: "n", v: deal.constructionBudget * 0.7 / deal.totalArea };
      // Soft costs €/sqm — estimate 30% of construction
      inputs["D29"] = { t: "n", v: deal.constructionBudget * 0.2 / deal.totalArea };
      // Project management as % of hard + soft
      inputs["E30"] = { t: "n", v: 0.05 };
    }
    // Acquisition price
    inputs["D23"] = { t: "n", v: deal.landCost };
    // Related acquisition costs (% of acq price) — default 8% Spain
    inputs["E24"] = { t: "n", v: 0.08 };

    // Financing
    inputs["D55"] = { t: "n", v: deal.loanAmount };
    // PIK rate (from deal — expressed as decimal 0.045 for 4.5%)
    inputs["D56"] = { t: "n", v: deal.pikSpread / 100 };
    // Cash interest rate
    inputs["D57"] = { t: "n", v: deal.interestRate / 100 };
    // Opening fee
    inputs["D58"] = { t: "n", v: deal.originationFee / 100 };

    // Duration (months)
    inputs["D7"] = { t: "n", v: deal.tenor };
  }

  // ===== Write and trigger download =====
  const outBuf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  const blob = new Blob([outBuf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeName = deal.projectName.replace(/[^a-zA-Z0-9-]/g, "_");
  a.href = url;
  a.download = `UW_${safeName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

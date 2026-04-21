import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { CheckCircle2, XCircle, Search, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { exportToExcel, stampedFilename } from "@/lib/exports/exportToExcel";
import { exportToCsv } from "@/lib/exports/exportToCsv";

interface ScreeningResult {
  label: string;
  pass: boolean;
  value: string;
  threshold: string;
}

const defaultCriteria = {
  maxLTV: 65,
  maxLTC: 75,
  minTicket: 5000000,
  maxTicket: 25000000,
  minDeveloperProjects: 5,
  minPreSales: 15,
  acceptedAssetTypes: ["Residential - Build to Sell", "Residential - Refurbishment & Sale"],
  acceptedLocations: ["Spain Tier 1", "Spain Tier 2", "Portugal Tier 1"],
};

export default function ScreeningTool() {
  const [formData, setFormData] = useState({
    projectName: "",
    borrower: "",
    location: "",
    assetType: "",
    loanAmount: "",
    gdv: "",
    currentAppraisal: "",
    totalCost: "",
    preSales: "",
    developerProjects: "",
  });
  const [results, setResults] = useState<ScreeningResult[] | null>(null);

  const handleScreen = () => {
    const loanAmount = parseFloat(formData.loanAmount) || 0;
    const gdv = parseFloat(formData.gdv) || 0;
    const currentAppraisal = parseFloat(formData.currentAppraisal) || 0;
    const totalCost = parseFloat(formData.totalCost) || 0;
    const preSales = parseFloat(formData.preSales) || 0;
    const devProjects = parseInt(formData.developerProjects) || 0;
    const ltv = gdv > 0 ? (loanAmount / gdv) * 100 : 0;
    const ltvCurrent = currentAppraisal > 0 ? (loanAmount / currentAppraisal) * 100 : 0;
    const ltc = totalCost > 0 ? (loanAmount / totalCost) * 100 : 0;

    const results: ScreeningResult[] = [
      { label: "Asset Type", pass: defaultCriteria.acceptedAssetTypes.includes(formData.assetType), value: formData.assetType || "Not specified", threshold: "Residential" },
      { label: "Location", pass: formData.location !== "", value: formData.location || "Not specified", threshold: "Spain/Portugal Tier 1-2" },
      { label: "LTV at Origination (vs GDV)", pass: ltv > 0 && ltv <= defaultCriteria.maxLTV, value: ltv > 0 ? `${ltv.toFixed(1)}%` : "N/A", threshold: `≤ ${defaultCriteria.maxLTV}%` },
    ];
    // Only surface current-appraisal LTV when the user provides one — some deals
    // (pure construction) don't have a current as-is appraisal.
    if (currentAppraisal > 0) {
      results.push({
        label: "LTV Current (vs Appraisal)",
        pass: ltvCurrent <= defaultCriteria.maxLTV,
        value: `${ltvCurrent.toFixed(1)}%`,
        threshold: `≤ ${defaultCriteria.maxLTV}%`,
      });
    }
    results.push(
      { label: "LTC", pass: ltc > 0 && ltc <= defaultCriteria.maxLTC, value: ltc > 0 ? `${ltc.toFixed(1)}%` : "N/A", threshold: `≤ ${defaultCriteria.maxLTC}%` },
      { label: "Ticket Size", pass: loanAmount >= defaultCriteria.minTicket && loanAmount <= defaultCriteria.maxTicket, value: loanAmount > 0 ? `€${(loanAmount / 1000000).toFixed(1)}M` : "N/A", threshold: `€${defaultCriteria.minTicket / 1000000}M - €${defaultCriteria.maxTicket / 1000000}M` },
      { label: "Developer Track Record", pass: devProjects >= defaultCriteria.minDeveloperProjects, value: `${devProjects} projects`, threshold: `≥ ${defaultCriteria.minDeveloperProjects} projects` },
      { label: "Pre-Sales Level", pass: preSales >= defaultCriteria.minPreSales, value: `${preSales}%`, threshold: `≥ ${defaultCriteria.minPreSales}%` },
    );
    setResults(results);
  };

  const passCount = results?.filter(r => r.pass).length || 0;
  const totalCount = results?.length || 0;
  const score = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;

  const handleReset = () => {
    setFormData({ projectName: "", borrower: "", location: "", assetType: "", loanAmount: "", gdv: "", currentAppraisal: "", totalCost: "", preSales: "", developerProjects: "" });
    setResults(null);
  };

  const buildExportRows = () => {
    const inputRows = [
      { Field: "Project Name", Value: formData.projectName },
      { Field: "Borrower / Sponsor", Value: formData.borrower },
      { Field: "Asset Type", Value: formData.assetType },
      { Field: "Location", Value: formData.location },
      { Field: "Loan Amount (EUR)", Value: formData.loanAmount },
      { Field: "GDV (EUR)", Value: formData.gdv },
      { Field: "Current Appraisal (EUR)", Value: formData.currentAppraisal },
      { Field: "Total Cost (EUR)", Value: formData.totalCost },
      { Field: "Pre-Sales (%)", Value: formData.preSales },
      { Field: "Developer Projects", Value: formData.developerProjects },
    ];
    const resultRows = (results ?? []).map((r) => ({
      Criterion: r.label,
      Value: r.value,
      Threshold: r.threshold,
      Pass: r.pass ? "Yes" : "No",
    }));
    const criteriaRows = [
      { Criterion: "Max LTV", Threshold: `${defaultCriteria.maxLTV}%` },
      { Criterion: "Max LTC", Threshold: `${defaultCriteria.maxLTC}%` },
      { Criterion: "Min Ticket", Threshold: `€${defaultCriteria.minTicket.toLocaleString()}` },
      { Criterion: "Max Ticket", Threshold: `€${defaultCriteria.maxTicket.toLocaleString()}` },
      { Criterion: "Min Developer Projects", Threshold: `${defaultCriteria.minDeveloperProjects}` },
      { Criterion: "Min Pre-Sales", Threshold: `${defaultCriteria.minPreSales}%` },
      { Criterion: "Accepted Asset Types", Threshold: defaultCriteria.acceptedAssetTypes.join("; ") },
    ];
    return { inputRows, resultRows, criteriaRows };
  };

  const handleExportExcel = () => {
    const { inputRows, resultRows, criteriaRows } = buildExportRows();
    exportToExcel(stampedFilename("Screening"), [
      { name: "Inputs", rows: inputRows },
      { name: "Results", rows: resultRows.length > 0 ? resultRows : [{ Criterion: "(no results yet)", Value: "", Threshold: "", Pass: "" }] },
      { name: "Fund Criteria", rows: criteriaRows },
    ]);
  };

  const handleExportCsv = () => {
    const { resultRows, criteriaRows } = buildExportRows();
    const rows = resultRows.length > 0 ? resultRows : criteriaRows;
    exportToCsv(stampedFilename("Screening"), rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <ExportMenu
          onExcel={handleExportExcel}
          onCsv={handleExportCsv}
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-primary mb-4">Quick Deal Screening</h2>
          <p className="text-sm text-slate-500 mb-6">Input basic deal parameters to get an instant pass/fail assessment against fund investment criteria.</p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-500">Project Name</Label>
                <Input value={formData.projectName} onChange={e => setFormData(p => ({ ...p, projectName: e.target.value }))} placeholder="e.g. Residencial Sol" className="mt-1 bg-muted border-border" />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Borrower / Sponsor</Label>
                <Input value={formData.borrower} onChange={e => setFormData(p => ({ ...p, borrower: e.target.value }))} placeholder="e.g. Grupo XYZ" className="mt-1 bg-muted border-border" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-500">Asset Type</Label>
                <Select value={formData.assetType} onValueChange={v => setFormData(p => ({ ...p, assetType: v }))}>
                  <SelectTrigger className="mt-1 bg-muted border-border"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Residential - Build to Sell">Residential - Build to Sell</SelectItem>
                    <SelectItem value="Residential - Refurbishment & Sale">Residential - Refurbishment</SelectItem>
                    <SelectItem value="Mixed Use">Mixed Use</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-slate-500">Location</Label>
                <Select value={formData.location} onValueChange={v => setFormData(p => ({ ...p, location: v }))}>
                  <SelectTrigger className="mt-1 bg-muted border-border"><SelectValue placeholder="Select location" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Madrid">Madrid</SelectItem>
                    <SelectItem value="Barcelona">Barcelona</SelectItem>
                    <SelectItem value="Valencia">Valencia</SelectItem>
                    <SelectItem value="Málaga / Costa del Sol">Málaga / Costa del Sol</SelectItem>
                    <SelectItem value="Palma de Mallorca">Palma de Mallorca</SelectItem>
                    <SelectItem value="Lisbon">Lisbon</SelectItem>
                    <SelectItem value="Other Spain">Other Spain</SelectItem>
                    <SelectItem value="Other Portugal">Other Portugal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-500">Loan Amount (€)</Label>
                <Input type="number" value={formData.loanAmount} onChange={e => setFormData(p => ({ ...p, loanAmount: e.target.value }))} placeholder="12,000,000" className="mt-1 bg-muted border-border" />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Total Project Cost (€)</Label>
                <Input type="number" value={formData.totalCost} onChange={e => setFormData(p => ({ ...p, totalCost: e.target.value }))} placeholder="18,000,000" className="mt-1 bg-muted border-border" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-500">GDV (€)</Label>
                <Input type="number" value={formData.gdv} onChange={e => setFormData(p => ({ ...p, gdv: e.target.value }))} placeholder="30,000,000" className="mt-1 bg-muted border-border" />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Current Appraisal (€) <span className="text-slate-400">— optional</span></Label>
                <Input type="number" value={formData.currentAppraisal} onChange={e => setFormData(p => ({ ...p, currentAppraisal: e.target.value }))} placeholder="22,000,000" className="mt-1 bg-muted border-border" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-500">Pre-Sales (%)</Label>
                <Input type="number" value={formData.preSales} onChange={e => setFormData(p => ({ ...p, preSales: e.target.value }))} placeholder="25" className="mt-1 bg-muted border-border" />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Developer Completed Projects</Label>
                <Input type="number" value={formData.developerProjects} onChange={e => setFormData(p => ({ ...p, developerProjects: e.target.value }))} placeholder="8" className="mt-1 bg-muted border-border" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleScreen} className="flex-1 gap-2"><Search className="h-4 w-4" />Screen Deal</Button>
              <Button variant="outline" onClick={handleReset} className="gap-2"><RotateCcw className="h-4 w-4" />Reset</Button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-primary mb-4">Screening Results</h2>
          {results ? (
            <div className="space-y-4 animate-fade-in">
              <div className={cn("rounded-lg p-4 text-center", score >= 80 ? "bg-success/10" : score >= 60 ? "bg-warning/10" : "bg-destructive/10")}>
                <p className="text-sm font-medium text-slate-500 mb-1">Screening Score</p>
                <p className={cn("font-display text-4xl font-bold", score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-destructive")}>{score}%</p>
                <p className="text-sm text-slate-500 mt-1">{passCount}/{totalCount} criteria passed</p>
                <p className={cn("mt-2 text-sm font-semibold", score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-destructive")}>
                  {score >= 80 ? "PROCEED TO DUE DILIGENCE" : score >= 60 ? "CONDITIONAL — REVIEW REQUIRED" : "DOES NOT MEET CRITERIA"}
                </p>
              </div>
              <div className="space-y-2">
                {results.map((r) => (
                  <div key={r.label} className={cn("flex items-center justify-between rounded-lg border px-4 py-3", r.pass ? "border-success/20 bg-success/5" : "border-destructive/20 bg-destructive/5")}>
                    <div className="flex items-center gap-3">
                      {r.pass ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}
                      <div>
                        <p className="text-sm font-medium text-primary">{r.label}</p>
                        <p className="text-xs text-slate-500">Threshold: {r.threshold}</p>
                      </div>
                    </div>
                    <p className={cn("text-sm font-semibold", r.pass ? "text-success" : "text-destructive")}>{r.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="h-12 w-12 text-slate-500/30 mb-4" />
              <p className="text-sm text-slate-500">Enter deal parameters and click "Screen Deal" to assess against fund criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

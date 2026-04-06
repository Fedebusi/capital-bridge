import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, Search, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

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
    totalCost: "",
    preSales: "",
    developerProjects: "",
  });
  const [results, setResults] = useState<ScreeningResult[] | null>(null);

  const handleScreen = () => {
    const loanAmount = parseFloat(formData.loanAmount) || 0;
    const gdv = parseFloat(formData.gdv) || 0;
    const totalCost = parseFloat(formData.totalCost) || 0;
    const preSales = parseFloat(formData.preSales) || 0;
    const devProjects = parseInt(formData.developerProjects) || 0;
    const ltv = gdv > 0 ? (loanAmount / gdv) * 100 : 0;
    const ltc = totalCost > 0 ? (loanAmount / totalCost) * 100 : 0;

    setResults([
      { label: "Asset Type", pass: defaultCriteria.acceptedAssetTypes.includes(formData.assetType), value: formData.assetType || "Not specified", threshold: "Residential" },
      { label: "Location", pass: formData.location !== "", value: formData.location || "Not specified", threshold: "Spain/Portugal Tier 1-2" },
      { label: "LTV at Origination", pass: ltv > 0 && ltv <= defaultCriteria.maxLTV, value: ltv > 0 ? `${ltv.toFixed(1)}%` : "N/A", threshold: `≤ ${defaultCriteria.maxLTV}%` },
      { label: "LTC", pass: ltc > 0 && ltc <= defaultCriteria.maxLTC, value: ltc > 0 ? `${ltc.toFixed(1)}%` : "N/A", threshold: `≤ ${defaultCriteria.maxLTC}%` },
      { label: "Ticket Size", pass: loanAmount >= defaultCriteria.minTicket && loanAmount <= defaultCriteria.maxTicket, value: loanAmount > 0 ? `€${(loanAmount / 1000000).toFixed(1)}M` : "N/A", threshold: `€${defaultCriteria.minTicket / 1000000}M - €${defaultCriteria.maxTicket / 1000000}M` },
      { label: "Developer Track Record", pass: devProjects >= defaultCriteria.minDeveloperProjects, value: `${devProjects} projects`, threshold: `≥ ${defaultCriteria.minDeveloperProjects} projects` },
      { label: "Pre-Sales Level", pass: preSales >= defaultCriteria.minPreSales, value: `${preSales}%`, threshold: `≥ ${defaultCriteria.minPreSales}%` },
    ]);
  };

  const passCount = results?.filter(r => r.pass).length || 0;
  const totalCount = results?.length || 0;
  const score = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;

  const handleReset = () => {
    setFormData({ projectName: "", borrower: "", location: "", assetType: "", loanAmount: "", gdv: "", totalCost: "", preSales: "", developerProjects: "" });
    setResults(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Quick Deal Screening</h2>
          <p className="text-sm text-muted-foreground mb-6">Input basic deal parameters to get an instant pass/fail assessment against fund investment criteria.</p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Project Name</Label>
                <Input value={formData.projectName} onChange={e => setFormData(p => ({ ...p, projectName: e.target.value }))} placeholder="e.g. Residencial Sol" className="mt-1 bg-muted border-border" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Borrower / Sponsor</Label>
                <Input value={formData.borrower} onChange={e => setFormData(p => ({ ...p, borrower: e.target.value }))} placeholder="e.g. Grupo XYZ" className="mt-1 bg-muted border-border" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Asset Type</Label>
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
                <Label className="text-xs text-muted-foreground">Location</Label>
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Loan Amount (€)</Label>
                <Input type="number" value={formData.loanAmount} onChange={e => setFormData(p => ({ ...p, loanAmount: e.target.value }))} placeholder="12,000,000" className="mt-1 bg-muted border-border" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">GDV (€)</Label>
                <Input type="number" value={formData.gdv} onChange={e => setFormData(p => ({ ...p, gdv: e.target.value }))} placeholder="30,000,000" className="mt-1 bg-muted border-border" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Total Project Cost (€)</Label>
                <Input type="number" value={formData.totalCost} onChange={e => setFormData(p => ({ ...p, totalCost: e.target.value }))} placeholder="18,000,000" className="mt-1 bg-muted border-border" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Pre-Sales (%)</Label>
                <Input type="number" value={formData.preSales} onChange={e => setFormData(p => ({ ...p, preSales: e.target.value }))} placeholder="25" className="mt-1 bg-muted border-border" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Developer Completed Projects</Label>
                <Input type="number" value={formData.developerProjects} onChange={e => setFormData(p => ({ ...p, developerProjects: e.target.value }))} placeholder="8" className="mt-1 bg-muted border-border" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleScreen} className="flex-1 gap-2"><Search className="h-4 w-4" />Screen Deal</Button>
              <Button variant="outline" onClick={handleReset} className="gap-2"><RotateCcw className="h-4 w-4" />Reset</Button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Screening Results</h2>
          {results ? (
            <div className="space-y-4 animate-fade-in">
              <div className={cn("rounded-lg p-4 text-center", score >= 80 ? "bg-success/10" : score >= 60 ? "bg-warning/10" : "bg-destructive/10")}>
                <p className="text-sm font-medium text-muted-foreground mb-1">Screening Score</p>
                <p className={cn("font-display text-4xl font-bold", score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-destructive")}>{score}%</p>
                <p className="text-sm text-muted-foreground mt-1">{passCount}/{totalCount} criteria passed</p>
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
                        <p className="text-sm font-medium text-foreground">{r.label}</p>
                        <p className="text-xs text-muted-foreground">Threshold: {r.threshold}</p>
                      </div>
                    </div>
                    <p className={cn("text-sm font-semibold", r.pass ? "text-success" : "text-destructive")}>{r.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">Enter deal parameters and click "Screen Deal" to assess against fund criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

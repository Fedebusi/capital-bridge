import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, Search, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface ScreeningResult {
  label: string;
  pass: boolean;
  value: string;
}

const criteria = {
  maxLTV: 65,
  maxLTC: 75,
  minTicket: 5_000_000,
  maxTicket: 25_000_000,
  minPreSales: 15,
  acceptedTypes: ["Residential - Build to Sell", "Residential - Refurbishment & Sale"],
};

function formatThousands(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("it-IT");
}

function parseRawNumber(formatted: string): string {
  return formatted.replace(/\./g, "").replace(/,/g, "");
}

export default function QuickScreenDialog() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<ScreeningResult[] | null>(null);
  const [form, setForm] = useState({
    assetType: "",
    loanAmount: "",
    gdv: "",
    totalCost: "",
    preSales: "",
  });

  const handleCurrencyChange = (field: "loanAmount" | "gdv" | "totalCost") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setForm(p => ({ ...p, [field]: raw }));
  };

  const displayCurrency = (value: string) => value ? formatThousands(value) : "";

  const handleScreen = () => {
    const loan = parseFloat(form.loanAmount) || 0;
    const gdv = parseFloat(form.gdv) || 0;
    const cost = parseFloat(form.totalCost) || 0;
    const preSales = parseFloat(form.preSales) || 0;
    const ltv = gdv > 0 ? (loan / gdv) * 100 : 0;
    const ltc = cost > 0 ? (loan / cost) * 100 : 0;

    setResults([
      { label: "Asset Type", pass: criteria.acceptedTypes.includes(form.assetType), value: form.assetType || "—" },
      { label: "LTV", pass: ltv > 0 && ltv <= criteria.maxLTV, value: ltv > 0 ? `${ltv.toFixed(1)}%` : "—" },
      { label: "LTC", pass: ltc > 0 && ltc <= criteria.maxLTC, value: ltc > 0 ? `${ltc.toFixed(1)}%` : "—" },
      { label: "Ticket", pass: loan >= criteria.minTicket && loan <= criteria.maxTicket, value: loan > 0 ? `€${(loan / 1e6).toFixed(1)}M` : "—" },
      { label: "Pre-Sales", pass: preSales >= criteria.minPreSales, value: `${preSales}%` },
    ]);
  };

  const passCount = results?.filter(r => r.pass).length || 0;
  const total = results?.length || 0;
  const score = total > 0 ? Math.round((passCount / total) * 100) : 0;

  const handleReset = () => {
    setResults(null);
    setForm({ assetType: "", loanAmount: "", gdv: "", totalCost: "", preSales: "" });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) handleReset(); }}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent">
          <Zap className="h-4 w-4" />
          Quick Screen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Search className="h-5 w-5 text-accent" />
            Quick Opportunity Screen
          </DialogTitle>
        </DialogHeader>

        {!results ? (
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-xs text-slate-500">Asset Type</Label>
              <Select value={form.assetType} onValueChange={v => setForm(p => ({ ...p, assetType: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Residential - Build to Sell">Residential - Build to Sell</SelectItem>
                  <SelectItem value="Residential - Refurbishment & Sale">Residential - Refurbishment</SelectItem>
                  <SelectItem value="Mixed Use">Mixed Use</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-slate-500">Loan (€)</Label>
                <Input type="text" inputMode="numeric" value={displayCurrency(form.loanAmount)} onChange={handleCurrencyChange("loanAmount")} placeholder="12.000.000" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-slate-500">GDV (€)</Label>
                <Input type="text" inputMode="numeric" value={displayCurrency(form.gdv)} onChange={handleCurrencyChange("gdv")} placeholder="30.000.000" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Total Cost (€)</Label>
                <Input type="text" inputMode="numeric" value={displayCurrency(form.totalCost)} onChange={handleCurrencyChange("totalCost")} placeholder="18.000.000" className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Pre-Sales (%)</Label>
              <Input type="number" value={form.preSales} onChange={e => setForm(p => ({ ...p, preSales: e.target.value }))} placeholder="25" className="mt-1" />
            </div>
            <Button onClick={handleScreen} className="w-full gap-2">
              <Search className="h-4 w-4" />
              Run Screening
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2 animate-fade-in">
            <div className={cn(
              "rounded-lg p-4 text-center",
              score >= 80 ? "bg-success/10" : score >= 60 ? "bg-warning/10" : "bg-destructive/10"
            )}>
              <p className={cn("font-display text-3xl font-bold", score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-destructive")}>{score}%</p>
              <p className="text-xs text-slate-500 mt-1">{passCount}/{total} criteria passed</p>
              <p className={cn("mt-1.5 text-xs font-semibold", score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-destructive")}>
                {score >= 80 ? "PROCEED TO DD" : score >= 60 ? "REVIEW REQUIRED" : "DOES NOT MEET CRITERIA"}
              </p>
            </div>
            <div className="space-y-1.5">
              {results.map(r => (
                <div key={r.label} className={cn("flex items-center justify-between rounded-lg px-3 py-2 text-sm", r.pass ? "bg-success/5" : "bg-destructive/5")}>
                  <span className="flex items-center gap-2">
                    {r.pass ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <XCircle className="h-3.5 w-3.5 text-destructive" />}
                    {r.label}
                  </span>
                  <span className={cn("font-semibold", r.pass ? "text-success" : "text-destructive")}>{r.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset} className="flex-1">Screen Another</Button>
              <Button onClick={() => { setOpen(false); navigate("/screening"); }} className="flex-1">Full Screening →</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

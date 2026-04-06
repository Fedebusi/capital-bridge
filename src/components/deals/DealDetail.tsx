import { Deal, formatCurrency, formatPercent, formatMillions, stageLabels, stageColors } from "@/data/sampleDeals";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, Building, TrendingUp, AlertTriangle,
  CheckCircle2, XCircle, Clock, DollarSign, Shield, FileText, HardHat, Banknote, FileSignature
} from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import DueDiligencePanel from "./DueDiligencePanel";
import ApprovalsPanel from "./ApprovalsPanel";
import LegalSecurityPanel from "./LegalSecurityPanel";
import PIKSchedulePanel from "./PIKSchedulePanel";
import ConstructionMonitoringPanel from "./ConstructionMonitoringPanel";
import WaterfallPanel from "./WaterfallPanel";
import TermSheetWaiverPanel from "./TermSheetWaiverPanel";

interface DealDetailProps {
  deal: Deal;
}

export default function DealDetail({ deal }: DealDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link to="/pipeline" className="mt-1 rounded-lg border border-border bg-card p-2 hover:bg-muted transition-colors">
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className={cn("inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide", stageColors[deal.stage])}>
              {stageLabels[deal.stage]}
            </span>
            {deal.covenants.some(c => c.status !== "compliant") && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
                <AlertTriangle className="h-3 w-3" /> Covenant Alert
              </span>
            )}
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">{deal.projectName}</h1>
          <p className="text-sm text-muted-foreground mt-1">{deal.borrower} • {deal.sponsor}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl font-bold text-accent">{formatMillions(deal.loanAmount)}</p>
          <p className="text-xs text-muted-foreground">Total Facility</p>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: "LTV", value: formatPercent(deal.ltv), warn: deal.ltv > 65 },
          { label: "LTC", value: formatPercent(deal.ltc), warn: deal.ltc > 75 },
          { label: "Total Rate", value: formatPercent(deal.totalRate) },
          { label: "Tenor", value: `${deal.tenor} months` },
          { label: "GDV", value: formatMillions(deal.gdv) },
          { label: "Pre-Sales", value: formatPercent(deal.preSalesPercent) },
        ].map((m, i) => (
          <div
            key={m.label}
            className="rounded-lg border border-border bg-card p-3 animate-fade-in"
            style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
          >
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{m.label}</p>
            <p className={cn("font-display text-lg font-bold mt-0.5", m.warn ? "text-warning" : "text-foreground")}>
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted border border-border flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="drawdowns">Drawdowns</TabsTrigger>
          <TabsTrigger value="covenants">Covenants</TabsTrigger>
          <TabsTrigger value="sales">Unit Sales</TabsTrigger>
          <TabsTrigger value="dd">Due Diligence</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="legal">Legal & Security</TabsTrigger>
          <TabsTrigger value="termsheet">Term Sheet</TabsTrigger>
          <TabsTrigger value="pik">PIK Schedule</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="waterfall">Waterfall</TabsTrigger>
          <TabsTrigger value="financials">Financial Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card title="Project Details" icon={Building}>
              <Row label="Asset Type" value={deal.assetType} />
              <Row label="Location" value={deal.location} />
              <Row label="Total Units" value={`${deal.totalUnits}`} />
              <Row label="Total Area" value={`${deal.totalArea.toLocaleString()} sqm`} />
              <Row label="Description" value={deal.description} />
            </Card>
            <Card title="Loan Structure" icon={DollarSign}>
              <Row label="Cash Interest" value={`${deal.interestRate}%`} />
              <Row label="PIK Spread" value={`${deal.pikSpread}%`} />
              <Row label="All-in Rate" value={`${deal.totalRate}%`} />
              <Row label="Origination Fee" value={`${deal.originationFee}%`} />
              <Row label="Exit Fee" value={`${deal.exitFee}%`} />
              <Row label="Maturity" value={deal.expectedMaturity} />
              <Row label="Amortization" value="Bullet at maturity" />
              <Row label="Interest" value="PIK — monthly accrual, capitalized" />
            </Card>
            <Card title="Construction & Budget" icon={TrendingUp}>
              <Row label="Construction Progress" value={`${deal.constructionProgress}%`} />
              <div><Progress value={deal.constructionProgress} className="h-2 mt-1" /></div>
              <Row label="Construction Budget" value={formatCurrency(deal.constructionBudget)} />
              <Row label="Spent to Date" value={formatCurrency(deal.constructionSpent)} />
              <Row label="Budget Utilization" value={deal.constructionBudget > 0 ? formatPercent((deal.constructionSpent / deal.constructionBudget) * 100) : "N/A"} />
              <Row label="Land Cost" value={formatCurrency(deal.landCost)} />
            </Card>
            <Card title="Developer Profile" icon={Shield}>
              <Row label="Sponsor" value={deal.sponsor} />
              <Row label="Experience" value={deal.developerExperience} />
              <Row label="Completed Projects" value={`${deal.developerTrackRecord}`} />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="drawdowns">
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="font-display text-sm font-semibold text-foreground">Drawdown Schedule</h3>
              <p className="text-xs text-muted-foreground mt-1">Disbursed: {formatCurrency(deal.disbursedAmount)} / {formatCurrency(deal.loanAmount)}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Milestone</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Scheduled</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Construction %</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deal.drawdowns.map(dd => (
                    <tr key={dd.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">{dd.milestone}</td>
                      <td className="px-4 py-3 text-right text-foreground">{formatCurrency(dd.amount)}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{dd.scheduledDate}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{dd.constructionProgress}%</td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
                          dd.status === "disbursed" ? "bg-success/10 text-success" :
                          dd.status === "approved" ? "bg-accent/10 text-accent" :
                          dd.status === "requested" ? "bg-warning/10 text-warning" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {dd.status === "disbursed" && <CheckCircle2 className="h-3 w-3" />}
                          {dd.status === "pending" && <Clock className="h-3 w-3" />}
                          {dd.status.charAt(0).toUpperCase() + dd.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="covenants">
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="font-display text-sm font-semibold text-foreground">Covenant Compliance</h3>
            </div>
            <div className="p-5 space-y-3">
              {deal.covenants.map(c => (
                <div key={c.name} className={cn(
                  "flex items-center justify-between rounded-lg border p-4",
                  c.status === "compliant" ? "border-success/20 bg-success/5" :
                  c.status === "watch" ? "border-warning/20 bg-warning/5" :
                  "border-destructive/20 bg-destructive/5"
                )}>
                  <div className="flex items-center gap-3">
                    {c.status === "compliant" ? <CheckCircle2 className="h-4 w-4 text-success" /> :
                     c.status === "watch" ? <AlertTriangle className="h-4 w-4 text-warning" /> :
                     <XCircle className="h-4 w-4 text-destructive" />}
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">Threshold: {c.threshold}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-sm font-semibold",
                      c.status === "compliant" ? "text-success" : c.status === "watch" ? "text-warning" : "text-destructive"
                    )}>{c.currentValue}</p>
                    <p className="text-xs uppercase text-muted-foreground">{c.status}</p>
                  </div>
                </div>
              ))}
              {deal.covenants.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No covenants configured</p>}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sales">
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="font-display text-sm font-semibold text-foreground">Unit Sales Tracker</h3>
              <p className="text-xs text-muted-foreground mt-1">Pre-sales: {deal.preSalesPercent}%</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Unit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Area</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">List Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Sale Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Release Price</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deal.unitSales.map(u => (
                    <tr key={u.unit} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">{u.unit}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.type}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{u.area} sqm</td>
                      <td className="px-4 py-3 text-right text-foreground">{formatCurrency(u.listPrice)}</td>
                      <td className="px-4 py-3 text-right text-foreground">{u.salePrice ? formatCurrency(u.salePrice) : "—"}</td>
                      <td className="px-4 py-3 text-right text-foreground">{u.releasePrice ? formatCurrency(u.releasePrice) : "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium",
                          u.status === "sold" ? "bg-success/10 text-success" :
                          u.status === "contracted" ? "bg-accent/10 text-accent" :
                          u.status === "reserved" ? "bg-warning/10 text-warning" :
                          "bg-muted text-muted-foreground"
                        )}>{u.status.charAt(0).toUpperCase() + u.status.slice(1)}</span>
                      </td>
                    </tr>
                  ))}
                  {deal.unitSales.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No unit sales data</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dd"><DueDiligencePanel dealId={deal.id} /></TabsContent>
        <TabsContent value="approvals"><ApprovalsPanel dealId={deal.id} /></TabsContent>
        <TabsContent value="legal"><LegalSecurityPanel dealId={deal.id} /></TabsContent>
        <TabsContent value="termsheet"><TermSheetWaiverPanel dealId={deal.id} /></TabsContent>
        <TabsContent value="pik"><PIKSchedulePanel dealId={deal.id} /></TabsContent>
        <TabsContent value="monitoring"><ConstructionMonitoringPanel dealId={deal.id} /></TabsContent>
        <TabsContent value="waterfall"><WaterfallPanel dealId={deal.id} /></TabsContent>

        <TabsContent value="financials">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card title="Current Exposure" icon={DollarSign}>
              <Row label="Committed Facility" value={formatCurrency(deal.loanAmount)} />
              <Row label="Disbursed" value={formatCurrency(deal.disbursedAmount)} />
              <Row label="Undrawn" value={formatCurrency(deal.loanAmount - deal.disbursedAmount)} />
              <Row label="Accrued PIK Interest" value={formatCurrency(deal.accruedPIK)} />
              <Row label="Total Exposure" value={formatCurrency(deal.totalExposure)} highlight />
            </Card>
            <Card title="Key Dates" icon={FileText}>
              <Row label="Date Received" value={deal.dateReceived} />
              {deal.termSheetDate && <Row label="Term Sheet Issued" value={deal.termSheetDate} />}
              {deal.icApprovalDate && <Row label="IC Approval" value={deal.icApprovalDate} />}
              {deal.closingDate && <Row label="Closing Date" value={deal.closingDate} />}
              {deal.firstDrawdownDate && <Row label="First Drawdown" value={deal.firstDrawdownDate} />}
              <Row label="Expected Maturity" value={deal.expectedMaturity} />
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Card({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <h3 className="font-display text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-accent" /> {title}
      </h3>
      <div className="space-y-3 text-sm">{children}</div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={cn("text-right", highlight ? "font-semibold text-accent" : "text-foreground")}>{value}</span>
    </div>
  );
}

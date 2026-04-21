import { Deal, formatCurrency, formatPercent, formatMillions, stageLabels, stageColors } from "@/data/sampleDeals";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Building, TrendingUp, AlertTriangle,
  CheckCircle2, XCircle, Clock, DollarSign, Shield, FileText, HardHat, Banknote, FileSignature, Route,
  Pencil, Trash2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { DealFormDialog } from "@/components/deals/DealFormDialog";
import { useUpdateDeal, useDeleteDeal } from "@/hooks/useSupabaseQuery";
import { useDeals } from "@/hooks/useDeals";
import { isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";
import DueDiligencePanel from "./DueDiligencePanel";
import ApprovalsPanel from "./ApprovalsPanel";
import LegalSecurityPanel from "./LegalSecurityPanel";
import PIKSchedulePanel from "./PIKSchedulePanel";
import ConstructionMonitoringPanel from "./ConstructionMonitoringPanel";
import WaterfallPanel from "./WaterfallPanel";
import TermSheetWaiverPanel from "./TermSheetWaiverPanel";
import LifecycleTracker from "./LifecycleTracker";
import LifecycleProgressBar from "./LifecycleProgressBar";
import { getCurrentPhaseNumber, getLifecycleProgress } from "@/data/lifecyclePhases";
import { useLifecycleForDeal } from "@/hooks/useDealSubdata";

interface DealDetailProps {
  deal: Deal;
}

export default function DealDetail({ deal }: DealDetailProps) {
  const { data: lifecycle } = useLifecycleForDeal(deal.id);
  const navigate = useNavigate();
  const updateDeal = useUpdateDeal();
  const deleteDeal = useDeleteDeal();
  const { removeDeal, updateDealInContext } = useDeals();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStageChange, setShowStageChange] = useState(false);
  const isLive = isSupabaseConfigured();

  const stageOrder = ["screening", "due_diligence", "ic_approval", "documentation", "active", "repaid"] as const;
  const currentIdx = stageOrder.indexOf(deal.stage as typeof stageOrder[number]);
  const nextStage = currentIdx >= 0 && currentIdx < stageOrder.length - 1 ? stageOrder[currentIdx + 1] : null;

  async function handleStageChange(newStage: string) {
    try {
      if (isLive) {
        await updateDeal.mutateAsync({ id: deal.id, stage: newStage });
      } else {
        updateDealInContext(deal.id, { stage: newStage as Deal["stage"] });
      }
      toast.success(`Stage changed to ${stageLabels[newStage as keyof typeof stageLabels] || newStage}`);
      setShowStageChange(false);
    } catch (err) {
      toast.error("Failed to change stage");
    }
  }

  async function handleDelete() {
    try {
      if (isLive) {
        await deleteDeal.mutateAsync(deal.id);
      } else {
        removeDeal(deal.id);
      }
      toast.success("Deal deleted");
      navigate("/pipeline");
    } catch (err) {
      toast.error("Failed to delete deal");
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link to="/pipeline" className="mt-1 rounded-full bg-slate-50 hover:bg-slate-100 p-2.5 transition-colors">
          <ArrowLeft className="h-4 w-4 text-slate-500" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide", stageColors[deal.stage])}>
              {stageLabels[deal.stage]}
            </span>
            {(deal.covenants ?? []).some(c => c.status !== "compliant") && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-warning bg-warning/10 px-3 py-1 rounded-full">
                <AlertTriangle className="h-3 w-3" /> Covenant Alert
              </span>
            )}
          </div>
          <h1 className="text-4xl font-bold text-primary tracking-tight">{deal.projectName}</h1>
          <p className="text-base text-slate-500 mt-2">{deal.borrower} • {deal.sponsor}</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="text-right mr-4">
            <p className="text-4xl font-bold text-accent tracking-tight">{formatMillions(deal.loanAmount)}</p>
            <p className="text-sm text-slate-500 mt-1">Total Facility</p>
          </div>
          {nextStage && (
            <button
              onClick={() => setShowStageChange(true)}
              className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm shadow-accent/20"
            >
              Advance to {stageLabels[nextStage as keyof typeof stageLabels]}
            </button>
          )}
          <DealFormDialog
            deal={deal}
            trigger={
              <button className="rounded-full bg-slate-50 hover:bg-slate-100 p-2.5 transition-colors" title="Edit deal">
                <Pencil className="h-4 w-4 text-slate-500" />
              </button>
            }
          />
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-full bg-slate-50 hover:bg-red-50 p-2.5 transition-colors group"
            title="Delete deal"
          >
            <Trash2 className="h-4 w-4 text-slate-400 group-hover:text-red-500" />
          </button>
        </div>
      </div>

      {/* Stage change confirmation */}
      <AlertDialog open={showStageChange} onOpenChange={setShowStageChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Advance to {nextStage ? stageLabels[nextStage as keyof typeof stageLabels] : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  This will move <strong>{deal.projectName}</strong> from{" "}
                  <strong>{stageLabels[deal.stage as keyof typeof stageLabels]}</strong> to{" "}
                  <strong>{nextStage ? stageLabels[nextStage as keyof typeof stageLabels] : ""}</strong>.
                </p>
                <p className="text-xs text-slate-500">
                  The stage change will be recorded in the audit trail and visible to the Capital Partner.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => nextStage && handleStageChange(nextStage)}
              className="rounded-full bg-accent hover:bg-accent/90"
              disabled={updateDeal.isPending}
            >
              {updateDeal.isPending ? "Advancing…" : `Advance to ${nextStage ? stageLabels[nextStage as keyof typeof stageLabels] : ""}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this deal?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  <strong>{deal.projectName}</strong> and all its sub-records (due diligence
                  items, approvals, term sheets, waivers, construction monitoring) will be
                  permanently removed.
                </p>
                <p className="text-xs text-destructive font-medium">
                  This action cannot be undone.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Keep deal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-full bg-red-600 hover:bg-red-700 focus:ring-red-500"
              disabled={deleteDeal.isPending}
            >
              {deleteDeal.isPending ? "Deleting…" : "Delete permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lifecycle Progress Bar */}
      {lifecycle && (
        <div className="rounded-2xl bg-slate-50 p-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <Route className="h-3 w-3" /> Loan Lifecycle — Phase {getCurrentPhaseNumber(lifecycle)}/12
            </p>
            <span className="text-xs font-semibold text-accent">{getLifecycleProgress(lifecycle)}% complete</span>
          </div>
          <LifecycleProgressBar lifecycle={lifecycle} />
        </div>
      )}

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
            className="rounded-2xl bg-slate-50 p-4 animate-fade-in"
            style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
          >
            <p className="text-[11px] text-slate-500 uppercase tracking-wide">{m.label}</p>
            <p className={cn("font-display text-lg font-bold mt-0.5", m.warn ? "text-warning" : "text-primary")}>
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="lifecycle" className="space-y-4">
        <TabsList className="bg-muted border border-slate-100 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
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

        <TabsContent value="lifecycle">
          {lifecycle ? (
            <LifecycleTracker lifecycle={lifecycle} />
          ) : (
            <div className="rounded-2xl bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">Lifecycle tracking not yet configured for this deal</p>
            </div>
          )}
        </TabsContent>

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
          <div className="rounded-2xl bg-slate-50 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-display text-sm font-semibold text-primary">Drawdown Schedule</h3>
              <p className="text-xs text-slate-500 mt-1">Disbursed: {formatCurrency(deal.disbursedAmount)} / {formatCurrency(deal.loanAmount)}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Milestone</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Amount</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Scheduled</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Construction %</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deal.drawdowns.map(dd => (
                    <tr key={dd.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-primary">{dd.milestone}</td>
                      <td className="px-4 py-3 text-right text-primary">{formatCurrency(dd.amount)}</td>
                      <td className="px-4 py-3 text-center text-slate-500">{dd.scheduledDate}</td>
                      <td className="px-4 py-3 text-center text-slate-500">{dd.constructionProgress}%</td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
                          dd.status === "disbursed" ? "bg-success/10 text-success" :
                          dd.status === "approved" ? "bg-accent/10 text-accent" :
                          dd.status === "requested" ? "bg-warning/10 text-warning" :
                          "bg-muted text-slate-500"
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
          <div className="rounded-2xl bg-slate-50 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-display text-sm font-semibold text-primary">Covenant Compliance</h3>
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
                      <p className="text-sm font-medium text-primary">{c.name}</p>
                      <p className="text-xs text-slate-500">Threshold: {c.threshold}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-sm font-semibold",
                      c.status === "compliant" ? "text-success" : c.status === "watch" ? "text-warning" : "text-destructive"
                    )}>{c.currentValue}</p>
                    <p className="text-xs uppercase text-slate-500">{c.status}</p>
                  </div>
                </div>
              ))}
              {deal.covenants.length === 0 && <p className="text-sm text-slate-500 text-center py-8">No covenants configured</p>}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sales">
          <div className="rounded-2xl bg-slate-50 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-display text-sm font-semibold text-primary">Unit Sales Tracker</h3>
              <p className="text-xs text-slate-500 mt-1">Pre-sales: {deal.preSalesPercent}%</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Unit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Type</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Area</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">List Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Sale Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Release Price</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deal.unitSales.map(u => (
                    <tr key={u.unit} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-primary">{u.unit}</td>
                      <td className="px-4 py-3 text-slate-500">{u.type}</td>
                      <td className="px-4 py-3 text-right text-slate-500">{u.area} sqm</td>
                      <td className="px-4 py-3 text-right text-primary">{formatCurrency(u.listPrice)}</td>
                      <td className="px-4 py-3 text-right text-primary">{u.salePrice ? formatCurrency(u.salePrice) : "—"}</td>
                      <td className="px-4 py-3 text-right text-primary">{u.releasePrice ? formatCurrency(u.releasePrice) : "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium",
                          u.status === "sold" ? "bg-success/10 text-success" :
                          u.status === "contracted" ? "bg-accent/10 text-accent" :
                          u.status === "reserved" ? "bg-warning/10 text-warning" :
                          "bg-muted text-slate-500"
                        )}>{u.status.charAt(0).toUpperCase() + u.status.slice(1)}</span>
                      </td>
                    </tr>
                  ))}
                  {deal.unitSales.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No unit sales data</td></tr>}
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
    <div className="rounded-2xl bg-slate-50 p-6">
      <h3 className="font-display text-sm font-semibold text-primary mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-accent" /> {title}
      </h3>
      <div className="space-y-3 text-sm">{children}</div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className={cn("text-right", highlight ? "font-semibold text-accent" : "text-primary")}>{value}</span>
    </div>
  );
}

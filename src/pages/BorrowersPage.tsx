import AppLayout from "@/components/layout/AppLayout";
import { sampleBorrowers, ratingColors } from "@/data/borrowers";
import { formatMillions, formatPercent } from "@/data/sampleDeals";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export default function BorrowersPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Borrower Base</h1>
          <p className="text-slate-500 text-sm mt-1">Complete registry of borrowers, sponsors, and counterparties</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Borrowers</p>
            <p className="font-display text-2xl font-bold text-foreground mt-1">{sampleBorrowers.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Rated A</p>
            <p className="font-display text-2xl font-bold text-accent mt-1">{sampleBorrowers.filter(b => b.internalRating === "A").length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">KYC Issues</p>
            <p className="font-display text-2xl font-bold text-warning mt-1">
              {sampleBorrowers.filter(b => b.kyc.some(k => k.status !== "valid")).length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Exposure</p>
            <p className="font-display text-2xl font-bold text-foreground mt-1">
              {formatMillions(sampleBorrowers.reduce((s, b) => s + b.totalExposure, 0))}
            </p>
          </div>
        </div>

        {/* Borrower Table */}
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Borrower</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Group</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Rating</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Active Deals</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Commitments</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Exposure</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Avg IRR</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Track Record</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">KYC</th>
                </tr>
              </thead>
              <tbody>
                {sampleBorrowers.map((b, i) => {
                  const kycOk = b.kyc.every(k => k.status === "valid");
                  const kycExpiring = b.kyc.some(k => k.status === "expiring_soon");
                  const kycBad = b.kyc.some(k => k.status === "expired" || k.status === "pending");
                  return (
                    <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}>
                      <td className="px-4 py-3">
                        <Link to={`/borrowers/${b.id}`} className="font-medium text-foreground hover:text-accent transition-colors">
                          {b.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{b.headquarters}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{b.group}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn("rounded-md px-2 py-0.5 text-xs font-bold", ratingColors[b.internalRating])}>
                          {b.internalRating}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-foreground">{b.numberOfActiveDeals}</td>
                      <td className="px-4 py-3 text-right text-foreground">{formatMillions(b.totalCommitments)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">{formatMillions(b.totalExposure)}</td>
                      <td className="px-4 py-3 text-center text-accent font-semibold">{b.avgIRR ? formatPercent(b.avgIRR) : "—"}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{b.completedProjects.length} projects</td>
                      <td className="px-4 py-3 text-center">
                        {kycOk ? <CheckCircle2 className="h-4 w-4 text-success mx-auto" /> :
                         kycBad ? <XCircle className="h-4 w-4 text-destructive mx-auto" /> :
                         <AlertTriangle className="h-4 w-4 text-warning mx-auto" />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

import AppLayout from "@/components/layout/AppLayout";
import { LoadingSkeleton, EmptyState } from "@/components/LoadingSkeleton";
import { BorrowerFormDialog } from "@/components/borrowers/BorrowerFormDialog";
import { sampleBorrowers, ratingColors, type Borrower } from "@/data/borrowers";
import { formatMillions, formatPercent } from "@/data/sampleDeals";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useBorrowersQuery } from "@/hooks/useSupabaseQuery";
import type { DbBorrower } from "@/types/database";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { CheckCircle2, AlertTriangle, XCircle, Plus, Users } from "lucide-react";

function dbBorrowerToFrontend(b: DbBorrower): Borrower {
  return {
    id: b.id,
    name: b.name,
    group: b.group_name,
    type: b.type,
    internalRating: b.internal_rating,
    ratingDate: b.rating_date,
    headquarters: b.headquarters,
    yearEstablished: b.year_established,
    website: b.website ?? undefined,
    description: b.description,
    totalExposure: Number(b.total_exposure),
    totalCommitments: Number(b.total_commitments),
    numberOfActiveDeals: b.number_of_active_deals,
    avgIRR: b.avg_irr ? Number(b.avg_irr) : undefined,
    avgMultiple: b.avg_multiple ? Number(b.avg_multiple) : undefined,
    contacts: [],
    corporateStructure: [],
    kyc: [],
    completedProjects: [],
    activeDealIds: [],
  };
}

export default function BorrowersPage() {
  const isLive = isSupabaseConfigured();
  const { data: dbBorrowers, isLoading } = useBorrowersQuery();

  if (isLoading) {
    return <AppLayout><LoadingSkeleton /></AppLayout>;
  }

  const borrowers: Borrower[] = isLive && dbBorrowers
    ? dbBorrowers.map(dbBorrowerToFrontend)
    : sampleBorrowers;
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary tracking-tight">Borrower Base</h1>
            <p className="text-slate-500 text-base mt-2">Complete registry of borrowers, sponsors, and counterparties</p>
          </div>
          <BorrowerFormDialog
            trigger={
              <button className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm">
                <Plus className="h-4 w-4" />
                New Borrower
              </button>
            }
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-2xl bg-slate-50 p-7 hover:bg-slate-100/70 transition-colors">
            <p className="text-sm text-slate-500 font-medium">Total Borrowers</p>
            <p className="text-3xl font-bold text-primary mt-4 tracking-tight">{borrowers.length}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-7 hover:bg-slate-100/70 transition-colors">
            <p className="text-sm text-slate-500 font-medium">Rated A</p>
            <p className="text-3xl font-bold text-accent mt-4 tracking-tight">{borrowers.filter(b => b.internalRating === "A").length}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-7 hover:bg-slate-100/70 transition-colors">
            <p className="text-sm text-slate-500 font-medium">KYC Issues</p>
            <p className="text-3xl font-bold text-warning mt-4 tracking-tight">
              {borrowers.filter(b => b.kyc.some(k => k.status !== "valid")).length}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-7 hover:bg-slate-100/70 transition-colors">
            <p className="text-sm text-slate-500 font-medium">Total Exposure</p>
            <p className="text-3xl font-bold text-primary mt-4 tracking-tight">
              {formatMillions(borrowers.reduce((s, b) => s + b.totalExposure, 0))}
            </p>
          </div>
        </div>

        {/* Borrower Table */}
        {borrowers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No borrowers yet"
            description="Add your first borrower or sponsor to start tracking exposures, KYC, and track record across the portfolio."
            action={
              <BorrowerFormDialog
                trigger={
                  <button className="flex items-center gap-2 rounded-full bg-accent text-white px-5 py-2 text-sm font-semibold hover:bg-accent/90 transition-colors shadow-sm">
                    <Plus className="h-4 w-4" />
                    New Borrower
                  </button>
                }
              />
            }
          />
        ) : (
        <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Borrower</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Group</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Rating</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Active Deals</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Commitments</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Exposure</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Avg IRR</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Track Record</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">KYC</th>
                </tr>
              </thead>
              <tbody>
                {borrowers.map((b, i) => {
                  const kycOk = b.kyc.every(k => k.status === "valid");
                  const kycExpiring = b.kyc.some(k => k.status === "expiring_soon");
                  const kycBad = b.kyc.some(k => k.status === "expired" || k.status === "pending");
                  return (
                    <tr key={b.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors animate-fade-in" style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}>
                      <td className="px-4 py-3">
                        <Link to={`/borrowers/${b.id}`} className="font-medium text-primary hover:text-accent transition-colors">
                          {b.name}
                        </Link>
                        <p className="text-xs text-slate-500">{b.headquarters}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{b.group}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn("rounded-md px-2 py-0.5 text-xs font-bold", ratingColors[b.internalRating])}>
                          {b.internalRating}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-primary">{b.numberOfActiveDeals}</td>
                      <td className="px-4 py-3 text-right text-primary">{formatMillions(b.totalCommitments)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-primary">{formatMillions(b.totalExposure)}</td>
                      <td className="px-4 py-3 text-center text-accent font-semibold">{b.avgIRR ? formatPercent(b.avgIRR) : "—"}</td>
                      <td className="px-4 py-3 text-center text-slate-500">{b.completedProjects.length} projects</td>
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
        )}
      </div>
    </AppLayout>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useCreateDeal, useUpdateDeal } from "@/hooks/useSupabaseQuery";
import { useDeals } from "@/hooks/useDeals";
import type { Deal, DealStage } from "@/data/sampleDeals";

const dealSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  borrower: z.string().min(1, "Borrower is required"),
  sponsor: z.string().min(1, "Sponsor is required"),
  location: z.string().min(1, "Location is required"),
  city: z.string().min(1, "City is required"),
  stage: z.string(),
  assetType: z.string().min(1, "Asset type is required"),
  description: z.string(),
  loanAmount: z.coerce.number().positive("Must be positive"),
  currency: z.string().default("EUR"),
  interestRate: z.coerce.number().min(0).max(100),
  pikSpread: z.coerce.number().min(0).max(100),
  originationFee: z.coerce.number().min(0).max(100),
  exitFee: z.coerce.number().min(0).max(100),
  tenor: z.coerce.number().int().positive(),
  gdv: z.coerce.number().min(0),
  constructionBudget: z.coerce.number().min(0),
  landCost: z.coerce.number().min(0),
  totalUnits: z.coerce.number().int().min(0),
  totalArea: z.coerce.number().min(0),
  preSalesPercent: z.coerce.number().min(0).max(100),
  developerExperience: z.string(),
  developerTrackRecord: z.coerce.number().int().min(0),
});

type DealFormData = z.infer<typeof dealSchema>;

interface DealFormDialogProps {
  deal?: Deal; // If provided, edit mode
  trigger?: React.ReactNode;
}

export function DealFormDialog({ deal, trigger }: DealFormDialogProps) {
  const [open, setOpen] = useState(false);
  const { addDeals, updateDealInContext } = useDeals();
  const createDeal = useCreateDeal();
  const updateDeal = useUpdateDeal();
  const isLive = isSupabaseConfigured();
  const isEdit = !!deal;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: deal
      ? {
          projectName: deal.projectName,
          borrower: deal.borrower,
          sponsor: deal.sponsor,
          location: deal.location,
          city: deal.city,
          stage: deal.stage,
          assetType: deal.assetType,
          description: deal.description,
          loanAmount: deal.loanAmount,
          currency: deal.currency,
          interestRate: deal.interestRate,
          pikSpread: deal.pikSpread,
          originationFee: deal.originationFee,
          exitFee: deal.exitFee,
          tenor: deal.tenor,
          gdv: deal.gdv,
          constructionBudget: deal.constructionBudget,
          landCost: deal.landCost,
          totalUnits: deal.totalUnits,
          totalArea: deal.totalArea,
          preSalesPercent: deal.preSalesPercent,
          developerExperience: deal.developerExperience,
          developerTrackRecord: deal.developerTrackRecord,
        }
      : {
          currency: "EUR",
          stage: "screening",
          interestRate: 4.5,
          pikSpread: 4.0,
          originationFee: 1.5,
          exitFee: 0.75,
        },
  });

  const interestRate = watch("interestRate") || 0;
  const pikSpread = watch("pikSpread") || 0;
  const totalRate = interestRate + pikSpread;
  const loanAmount = watch("loanAmount") || 0;
  const gdv = watch("gdv") || 0;
  const constructionBudget = watch("constructionBudget") || 0;
  const landCost = watch("landCost") || 0;
  const ltv = gdv > 0 ? ((loanAmount / gdv) * 100) : 0;
  const ltc = (constructionBudget + landCost) > 0 ? ((loanAmount / (constructionBudget + landCost)) * 100) : 0;

  async function onSubmit(data: DealFormData) {
    try {
      if (isEdit && deal) {
        if (isLive) {
          await updateDeal.mutateAsync({
            id: deal.id,
            project_name: data.projectName,
            borrower_name: data.borrower,
            sponsor: data.sponsor,
            location: data.location,
            city: data.city,
            stage: data.stage as DealStage,
            asset_type: data.assetType,
            description: data.description,
            loan_amount: data.loanAmount,
            currency: data.currency,
            interest_rate: data.interestRate,
            pik_spread: data.pikSpread,
            total_rate: totalRate,
            origination_fee: data.originationFee,
            exit_fee: data.exitFee,
            tenor: data.tenor,
            gdv: data.gdv,
            construction_budget: data.constructionBudget,
            land_cost: data.landCost,
            total_units: data.totalUnits,
            total_area: data.totalArea,
            pre_sales_percent: data.preSalesPercent,
            developer_experience: data.developerExperience,
            developer_track_record: data.developerTrackRecord,
            ltv: Number(ltv.toFixed(1)),
            ltc: Number(ltc.toFixed(1)),
          });
        } else {
          updateDealInContext(deal.id, {
            projectName: data.projectName,
            borrower: data.borrower,
            sponsor: data.sponsor,
            location: data.location,
            city: data.city,
            stage: data.stage as DealStage,
            assetType: data.assetType,
            description: data.description,
            loanAmount: data.loanAmount,
            currency: data.currency,
            interestRate: data.interestRate,
            pikSpread: data.pikSpread,
            totalRate,
            originationFee: data.originationFee,
            exitFee: data.exitFee,
            tenor: data.tenor,
            gdv: data.gdv,
            constructionBudget: data.constructionBudget,
            landCost: data.landCost,
            totalUnits: data.totalUnits,
            totalArea: data.totalArea,
            preSalesPercent: data.preSalesPercent,
            developerExperience: data.developerExperience,
            developerTrackRecord: data.developerTrackRecord,
            ltv: Number(ltv.toFixed(1)),
            ltc: Number(ltc.toFixed(1)),
          });
        }
        toast.success("Deal updated successfully");
      } else {
        const newDeal: Deal = {
          id: `deal-${Date.now()}`,
          projectName: data.projectName,
          borrower: data.borrower,
          sponsor: data.sponsor,
          location: data.location,
          city: data.city,
          coordinates: [40.4168, -3.7038], // Default Madrid
          stage: data.stage as DealStage,
          assetType: data.assetType,
          description: data.description,
          loanAmount: data.loanAmount,
          currency: data.currency,
          interestRate: data.interestRate,
          pikSpread: data.pikSpread,
          totalRate,
          originationFee: data.originationFee,
          exitFee: data.exitFee,
          tenor: data.tenor,
          maturityDate: "",
          disbursedAmount: 0,
          outstandingPrincipal: 0,
          accruedPIK: 0,
          totalExposure: 0,
          gdv: data.gdv,
          currentAppraisal: 0,
          totalUnits: data.totalUnits,
          totalArea: data.totalArea,
          constructionBudget: data.constructionBudget,
          constructionSpent: 0,
          constructionProgress: 0,
          landCost: data.landCost,
          ltv: Number(ltv.toFixed(1)),
          ltc: Number(ltc.toFixed(1)),
          preSalesPercent: data.preSalesPercent,
          developerExperience: data.developerExperience,
          developerTrackRecord: data.developerTrackRecord,
          dateReceived: new Date().toISOString().slice(0, 10),
          expectedMaturity: "",
          drawdowns: [],
          covenants: [],
          unitSales: [],
          tags: [],
        };

        if (isLive) {
          await createDeal.mutateAsync({
            project_name: data.projectName,
            borrower_id: null,
            borrower_name: data.borrower,
            sponsor: data.sponsor,
            location: data.location,
            city: data.city,
            coordinates: [40.4168, -3.7038],
            stage: data.stage as DealStage,
            asset_type: data.assetType,
            description: data.description,
            loan_amount: data.loanAmount,
            currency: data.currency,
            interest_rate: data.interestRate,
            pik_spread: data.pikSpread,
            total_rate: totalRate,
            origination_fee: data.originationFee,
            exit_fee: data.exitFee,
            tenor: data.tenor,
            maturity_date: "",
            disbursed_amount: 0,
            outstanding_principal: 0,
            accrued_pik: 0,
            total_exposure: 0,
            gdv: data.gdv,
            current_appraisal: 0,
            total_units: data.totalUnits,
            total_area: data.totalArea,
            construction_budget: data.constructionBudget,
            construction_spent: 0,
            construction_progress: 0,
            land_cost: data.landCost,
            ltv: Number(ltv.toFixed(1)),
            ltc: Number(ltc.toFixed(1)),
            pre_sales_percent: data.preSalesPercent,
            developer_experience: data.developerExperience,
            developer_track_record: data.developerTrackRecord,
            date_received: new Date().toISOString().slice(0, 10),
            expected_maturity: "",
            screening_score: null,
            tags: [],
            created_by: null,
          });
        } else {
          addDeals([newDeal]);
        }
        toast.success("Deal created successfully");
      }
      setOpen(false);
    } catch (err) {
      toast.error(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Deal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Deal" : "Create New Deal"}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Deal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project Name *</Label>
                  <Input {...register("projectName")} />
                  {errors.projectName && <p className="text-xs text-destructive">{errors.projectName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Stage</Label>
                  <Select defaultValue={watch("stage")} onValueChange={(v) => setValue("stage", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="screening">Screening</SelectItem>
                      <SelectItem value="due_diligence">Due Diligence</SelectItem>
                      <SelectItem value="ic_approval">IC Approval</SelectItem>
                      <SelectItem value="documentation">Documentation</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="repaid">Repaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Borrower *</Label>
                  <Input {...register("borrower")} />
                  {errors.borrower && <p className="text-xs text-destructive">{errors.borrower.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Sponsor *</Label>
                  <Input {...register("sponsor")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Input {...register("location")} placeholder="e.g. Marbella, Malaga" />
                </div>
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input {...register("city")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Asset Type *</Label>
                <Input {...register("assetType")} placeholder="e.g. Residential - Build to Sell" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea {...register("description")} rows={3} />
              </div>
            </div>

            {/* Financial Terms */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Financial Terms</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Loan Amount (EUR) *</Label>
                  <Input type="number" {...register("loanAmount")} />
                  {errors.loanAmount && <p className="text-xs text-destructive">{errors.loanAmount.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Cash Rate (%)</Label>
                  <Input type="number" step="0.01" {...register("interestRate")} />
                </div>
                <div className="space-y-2">
                  <Label>PIK Spread (%)</Label>
                  <Input type="number" step="0.01" {...register("pikSpread")} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Total Rate</Label>
                  <Input value={`${totalRate.toFixed(2)}%`} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Origination Fee (%)</Label>
                  <Input type="number" step="0.01" {...register("originationFee")} />
                </div>
                <div className="space-y-2">
                  <Label>Exit Fee (%)</Label>
                  <Input type="number" step="0.01" {...register("exitFee")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tenor (months)</Label>
                <Input type="number" {...register("tenor")} />
              </div>
            </div>

            {/* Project Metrics */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Project Metrics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>GDV (EUR)</Label>
                  <Input type="number" {...register("gdv")} />
                </div>
                <div className="space-y-2">
                  <Label>Construction Budget</Label>
                  <Input type="number" {...register("constructionBudget")} />
                </div>
                <div className="space-y-2">
                  <Label>Land Cost</Label>
                  <Input type="number" {...register("landCost")} />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>LTV</Label>
                  <Input value={`${ltv.toFixed(1)}%`} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>LTC</Label>
                  <Input value={`${ltc.toFixed(1)}%`} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Total Units</Label>
                  <Input type="number" {...register("totalUnits")} />
                </div>
                <div className="space-y-2">
                  <Label>Total Area (m2)</Label>
                  <Input type="number" {...register("totalArea")} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Pre-Sales (%)</Label>
                  <Input type="number" step="0.1" {...register("preSalesPercent")} />
                </div>
                <div className="space-y-2">
                  <Label>Developer Experience</Label>
                  <Input {...register("developerExperience")} placeholder="e.g. Established - 16 years" />
                </div>
                <div className="space-y-2">
                  <Label>Track Record (projects)</Label>
                  <Input type="number" {...register("developerTrackRecord")} />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={createDeal.isPending || updateDeal.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {isEdit ? "Save Changes" : "Create Deal"}
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

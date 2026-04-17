import { useState, useMemo, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Printer, Plus, X } from "lucide-react";
import type { Deal } from "@/data/sampleDeals";
import type { TermSheet } from "@/data/termSheetData";
import { buildTermSheetFromDeal } from "@/lib/buildTermSheetFromDeal";
import { generateTermSheetPDF } from "@/lib/generateTermSheetPDF";
import { formatCurrency } from "@/data/sampleDeals";
import { toast } from "sonner";

interface TermSheetEditorDialogProps {
  deal: Deal;
  baseline?: TermSheet | null;
  trigger: ReactNode;
}

export default function TermSheetEditorDialog({
  deal,
  baseline,
  trigger,
}: TermSheetEditorDialogProps) {
  const [open, setOpen] = useState(false);

  // Seed the form from either an existing term sheet or a synthesized one
  const initial = useMemo(
    () => baseline ?? buildTermSheetFromDeal(deal),
    [baseline, deal],
  );

  const [facility, setFacility] = useState(initial.keyTerms.facility);
  const [cashRate, setCashRate] = useState(initial.keyTerms.cashRate);
  const [pikSpread, setPikSpread] = useState(initial.keyTerms.pikSpread);
  const [originationFee, setOriginationFee] = useState(initial.keyTerms.originationFee);
  const [exitFee, setExitFee] = useState(initial.keyTerms.exitFee);
  const [tenor, setTenor] = useState(initial.keyTerms.tenor);
  const [ltv, setLtv] = useState(initial.keyTerms.ltv);
  const [ltc, setLtc] = useState(initial.keyTerms.ltc);
  const [minPresales, setMinPresales] = useState(initial.keyTerms.minPresales);
  const [securityPackage, setSecurityPackage] = useState<string[]>(
    initial.keyTerms.securityPackage,
  );
  const [newSecurityItem, setNewSecurityItem] = useState("");

  // Live-updating term sheet used for both preview and PDF
  const edited: TermSheet = {
    ...initial,
    keyTerms: {
      facility,
      cashRate,
      pikSpread,
      originationFee,
      exitFee,
      tenor,
      ltv,
      ltc,
      minPresales,
      securityPackage,
    },
  };

  function handleDownload() {
    try {
      generateTermSheetPDF(deal, edited);
      toast.success("Term sheet downloaded");
      setOpen(false);
    } catch {
      toast.error("Couldn't generate the PDF. Please retry.");
    }
  }

  function addSecurityItem() {
    const trimmed = newSecurityItem.trim();
    if (!trimmed) return;
    if (securityPackage.includes(trimmed)) return;
    setSecurityPackage([...securityPackage, trimmed]);
    setNewSecurityItem("");
  }

  function removeSecurityItem(item: string) {
    setSecurityPackage(securityPackage.filter((s) => s !== item));
  }

  const totalRate = cashRate + pikSpread;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Term sheet — {deal.projectName}</DialogTitle>
          <DialogDescription>
            Edit the key terms below. Changes apply to the downloaded PDF only — they are not
            saved to the record.
          </DialogDescription>
        </DialogHeader>

        <div className="grid lg:grid-cols-2 gap-6 mt-4">
          {/* Edit form */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wide">Edit terms</h3>

            <div className="space-y-3">
              <Field label="Facility amount (€)">
                <NumberInput value={facility} onChange={setFacility} step={100_000} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Cash rate (%)">
                  <NumberInput value={cashRate} onChange={setCashRate} step={0.1} />
                </Field>
                <Field label="PIK spread (%)">
                  <NumberInput value={pikSpread} onChange={setPikSpread} step={0.1} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Origination fee (%)">
                  <NumberInput value={originationFee} onChange={setOriginationFee} step={0.05} />
                </Field>
                <Field label="Exit fee (%)">
                  <NumberInput value={exitFee} onChange={setExitFee} step={0.05} />
                </Field>
              </div>
              <Field label="Tenor (months)">
                <NumberInput value={tenor} onChange={setTenor} step={1} />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Max LTV (%)">
                  <NumberInput value={ltv} onChange={setLtv} step={1} />
                </Field>
                <Field label="Max LTC (%)">
                  <NumberInput value={ltc} onChange={setLtc} step={1} />
                </Field>
                <Field label="Min pre-sales (%)">
                  <NumberInput value={minPresales} onChange={setMinPresales} step={1} />
                </Field>
              </div>

              <div>
                <Label className="text-xs text-slate-500">Security package</Label>
                <div className="mt-2 space-y-1.5">
                  {securityPackage.map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2"
                    >
                      <span className="text-xs text-slate-700">{item}</span>
                      <button
                        type="button"
                        onClick={() => removeSecurityItem(item)}
                        className="text-slate-400 hover:text-red-500"
                        aria-label={`Remove ${item}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newSecurityItem}
                    onChange={(e) => setNewSecurityItem(e.target.value)}
                    placeholder="Add security item…"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSecurityItem();
                      }
                    }}
                    className="rounded-full"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addSecurityItem}
                    className="rounded-full shrink-0"
                    aria-label="Add security item"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Live preview */}
          <div className="rounded-2xl bg-slate-50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wide">Preview</h3>

            <PreviewSection title="Parties">
              <PreviewRow label="Lender" value="CapitalBridge Fund I" />
              <PreviewRow label="Borrower" value={deal.borrower} />
              <PreviewRow label="Sponsor" value={deal.sponsor} />
              <PreviewRow label="Project" value={deal.projectName} />
              <PreviewRow label="Location" value={deal.location} />
            </PreviewSection>

            <PreviewSection title="Senior facility">
              <PreviewRow label="Commitment" value={formatCurrency(facility)} />
              <PreviewRow label="Tenor" value={`${tenor} months`} />
              <PreviewRow label="All-in rate" value={`${totalRate.toFixed(2)}%`} />
              <PreviewRow label="Cash / PIK" value={`${cashRate}% cash + ${pikSpread}% PIK`} />
            </PreviewSection>

            <PreviewSection title="Fees">
              <PreviewRow
                label="Origination"
                value={`${originationFee}% (${formatCurrency(Math.round((facility * originationFee) / 100))})`}
              />
              <PreviewRow
                label="Exit"
                value={`${exitFee}% (${formatCurrency(Math.round((facility * exitFee) / 100))})`}
              />
            </PreviewSection>

            <PreviewSection title="Financial covenants">
              <PreviewRow label="Max LTV" value={`${ltv}%`} />
              <PreviewRow label="Max LTC" value={`${ltc}%`} />
              <PreviewRow label="Min pre-sales" value={`${minPresales}%`} />
            </PreviewSection>

            <PreviewSection title="Security package">
              {securityPackage.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No items</p>
              ) : (
                <ul className="space-y-0.5">
                  {securityPackage.map((s) => (
                    <li key={s} className="text-xs text-slate-700">• {s}</li>
                  ))}
                </ul>
              )}
            </PreviewSection>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDownload}
            className="rounded-full bg-accent hover:bg-accent/90 text-white"
          >
            <Printer className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-slate-500">{label}</Label>
      {children}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <Input
      type="number"
      value={Number.isFinite(value) ? value : 0}
      step={step}
      onChange={(e) => {
        const parsed = parseFloat(e.target.value);
        onChange(Number.isFinite(parsed) ? parsed : 0);
      }}
      className="rounded-full"
    />
  );
}

function PreviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-primary text-right">{value}</span>
    </div>
  );
}

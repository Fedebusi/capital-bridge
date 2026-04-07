import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { downloadDealTemplate, parseDealsFromExcel } from "@/lib/excelDealImport";
import { formatMillions } from "@/data/sampleDeals";
import { useDeals } from "@/hooks/useDeals";
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Deal } from "@/data/sampleDeals";

export default function DealImportDialog() {
  const { addDeals } = useDeals();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const [parsedDeals, setParsedDeals] = useState<Deal[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const result = await parseDealsFromExcel(file);
    setParsedDeals(result.deals);
    setErrors(result.errors);
    setStep("preview");
  };

  const handleImport = () => {
    addDeals(parsedDeals);
    setStep("done");
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setStep("upload");
      setParsedDeals([]);
      setErrors([]);
      setFileName("");
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 text-xs font-bold">
          <Upload className="h-3.5 w-3.5" />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            {step === "upload" ? "Import Deals from Excel" :
             step === "preview" ? "Review Import" :
             "Import Complete"}
          </DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-6 pt-2">
            {/* Download template */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
              <h4 className="text-sm font-bold text-primary mb-1">Step 1: Download Template</h4>
              <p className="text-xs text-slate-500 mb-3">
                Download the Excel template, fill in your deal data, then upload it below.
              </p>
              <Button variant="outline" onClick={downloadDealTemplate} className="gap-2 text-xs">
                <Download className="h-3.5 w-3.5" />
                Download Template (.xlsx)
              </Button>
            </div>

            {/* Upload */}
            <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center hover:border-primary/30 transition-colors">
              <h4 className="text-sm font-bold text-primary mb-1">Step 2: Upload Completed File</h4>
              <p className="text-xs text-slate-500 mb-4">
                Drag & drop or click to select your Excel file
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFile}
                className="hidden"
              />
              <Button onClick={() => fileRef.current?.click()} className="gap-2">
                <Upload className="h-4 w-4" />
                Select Excel File
              </Button>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4 pt-2">
            {/* File info */}
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-primary">{fileName}</span>
              </div>
              <span className="text-xs text-slate-500">{parsedDeals.length} deal(s) found</span>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-bold text-amber-700 flex items-center gap-1 mb-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> {errors.length} warning(s)
                </p>
                <ul className="space-y-0.5">
                  {errors.map((err, i) => (
                    <li key={i} className="text-[11px] text-amber-600">{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preview table */}
            {parsedDeals.length > 0 && (
              <div className="rounded-xl border border-slate-100 overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-400 sticky top-0">
                    <tr>
                      <th className="px-4 py-2">Project</th>
                      <th className="px-4 py-2">Borrower</th>
                      <th className="px-4 py-2">Location</th>
                      <th className="px-4 py-2">Facility</th>
                      <th className="px-4 py-2">Rate</th>
                      <th className="px-4 py-2">LTV</th>
                      <th className="px-4 py-2">Tenor</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-slate-100">
                    {parsedDeals.map((d, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-bold text-primary">{d.projectName}</td>
                        <td className="px-4 py-2.5 text-slate-500">{d.borrower}</td>
                        <td className="px-4 py-2.5 text-slate-500">{d.location}</td>
                        <td className="px-4 py-2.5 font-bold text-primary">{formatMillions(d.loanAmount)}</td>
                        <td className="px-4 py-2.5 text-primary">{d.totalRate}%</td>
                        <td className="px-4 py-2.5">
                          <span className={cn("font-bold", d.ltv > 65 ? "text-amber-500" : "text-primary")}>
                            {d.ltv}%
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-500">{d.tenor}m</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep("upload")} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={parsedDeals.length === 0}
                className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                Import {parsedDeals.length} Deal(s)
              </Button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="py-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-primary">{parsedDeals.length} deal(s) imported</h3>
              <p className="text-sm text-slate-500 mt-1">
                All deals have been added to the Pipeline in "Screening" stage.
              </p>
            </div>
            <Button onClick={handleClose} className="gap-2">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

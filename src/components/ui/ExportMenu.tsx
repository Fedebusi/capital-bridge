import { Download, FileSpreadsheet, FileText, FileDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface ExportMenuProps {
  /** Handler for Excel (.xlsx) export. Omit to hide the Excel option. */
  onExcel?: () => void;
  /** Handler for CSV export. Omit to hide the CSV option. */
  onCsv?: () => void;
  /** Handler for downloading a pre-formatted template. Omit to hide. */
  onTemplate?: () => void;
  /** Template option label (defaults to "Download template") */
  templateLabel?: string;
  /** Disable the trigger (e.g. when there is nothing to export) */
  disabled?: boolean;
  /** Extra button classes */
  className?: string;
  /** Button label (defaults to "Export") */
  label?: string;
}

/**
 * A small dropdown menu that offers Excel / CSV / Template export actions.
 * Used consistently across every list page to keep the UI uniform.
 */
export function ExportMenu({
  onExcel,
  onCsv,
  onTemplate,
  templateLabel = "Download template",
  disabled,
  className,
  label = "Export",
}: ExportMenuProps) {
  const hasActions = !!onExcel || !!onCsv || !!onTemplate;
  if (!hasActions) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "inline-flex items-center gap-2 rounded-full bg-slate-50 hover:bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors",
            disabled && "opacity-50 cursor-not-allowed",
            className,
          )}
        >
          <Download className="h-4 w-4" />
          {label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Export data
        </DropdownMenuLabel>
        {onExcel && (
          <DropdownMenuItem onClick={onExcel} className="cursor-pointer gap-2">
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Excel (.xlsx)
          </DropdownMenuItem>
        )}
        {onCsv && (
          <DropdownMenuItem onClick={onCsv} className="cursor-pointer gap-2">
            <FileText className="h-4 w-4 text-slate-500" />
            CSV (.csv)
          </DropdownMenuItem>
        )}
        {onTemplate && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onTemplate} className="cursor-pointer gap-2">
              <FileDown className="h-4 w-4 text-accent" />
              {templateLabel}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { useRef, useState, type ReactNode } from "react";
import { Upload, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUploadDocument } from "@/hooks/useSupabaseQuery";
import { toast } from "sonner";

export type UploadBucket = "documents" | "site-photos";

export const ACCEPTED_FILE_TYPES = ".pdf,.jpg,.jpeg,.png,.webp";
export const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export interface FileUploadButtonProps {
  bucket: UploadBucket;
  /** Path prefix. File name is appended as `${prefix}/${timestamp}-${file.name}`. */
  pathPrefix: string;
  onUploaded?: (result: { path: string; file: File }) => void | Promise<void>;
  label?: string;
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
  accept?: string;
  /** Show a compact icon-only button. */
  compact?: boolean;
}

export function validateFile(file: File): string | null {
  if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
    return `File type "${file.type || "unknown"}" not allowed. Accepted: PDF, JPEG, PNG, WEBP`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum: 10MB`;
  }
  if (file.size === 0) {
    return "File is empty";
  }
  return null;
}

export function buildUploadPath(prefix: string, fileName: string): string {
  const trimmedPrefix = prefix.replace(/^\/+|\/+$/g, "");
  const safeName = fileName
    .replace(/[^a-zA-Z0-9_.\-]/g, "_")
    .replace(/\.{2,}/g, "_");
  const timestamp = Date.now();
  return `${trimmedPrefix}/${timestamp}-${safeName}`;
}

export default function FileUploadButton({
  bucket,
  pathPrefix,
  onUploaded,
  label = "Upload",
  icon,
  className,
  disabled,
  accept = ACCEPTED_FILE_TYPES,
  compact = false,
}: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadDocument();
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleClick = () => {
    if (!disabled && !upload.isPending) {
      inputRef.current?.click();
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset so same file can be picked again
    if (!file) return;

    const err = validateFile(file);
    if (err) {
      setValidationError(err);
      toast.error(err);
      return;
    }
    setValidationError(null);

    const path = buildUploadPath(pathPrefix, file.name);
    try {
      const result = await upload.mutateAsync({ bucket, path, file });
      await onUploaded?.({ path: result.path, file });
      toast.success(`Uploaded ${file.name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
      setValidationError(message);
    }
  };

  const isBusy = upload.isPending;

  const renderIcon = () => {
    if (isBusy) return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
    if (validationError) return <AlertCircle className="h-3.5 w-3.5" />;
    if (icon) return icon;
    return <Upload className="h-3.5 w-3.5" />;
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
        disabled={disabled || isBusy}
        data-testid="file-upload-input"
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isBusy}
        aria-label={label}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-primary transition-colors",
          "hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed",
          compact ? "px-2 py-1" : "px-3 py-1.5",
          validationError && "border-destructive/40 text-destructive",
          className,
        )}
      >
        {renderIcon()}
        {!compact && <span>{isBusy ? "Uploading…" : label}</span>}
      </button>
    </>
  );
}

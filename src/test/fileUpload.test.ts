import { describe, it, expect } from "vitest";
import {
  validateFile,
  buildUploadPath,
  MAX_FILE_SIZE_BYTES,
  ACCEPTED_MIME_TYPES,
} from "@/components/ui/FileUploadButton";

function makeFile(name: string, type: string, size: number): File {
  const file = new File([new Uint8Array(size > 0 ? 1 : 0)], name, { type });
  // Force the size (File objects use the blob size; we override via Object.defineProperty for test)
  Object.defineProperty(file, "size", { value: size });
  return file;
}

describe("validateFile", () => {
  it("accepts a valid PDF under limit", () => {
    const file = makeFile("report.pdf", "application/pdf", 1024);
    expect(validateFile(file)).toBeNull();
  });

  it("accepts JPEG, PNG, WEBP", () => {
    for (const type of ["image/jpeg", "image/png", "image/webp"]) {
      const file = makeFile("photo.img", type, 500);
      expect(validateFile(file)).toBeNull();
    }
  });

  it("rejects disallowed MIME types", () => {
    const file = makeFile("bad.exe", "application/x-msdownload", 100);
    const err = validateFile(file);
    expect(err).toMatch(/not allowed/);
  });

  it("rejects empty file type", () => {
    const file = makeFile("unknown", "", 100);
    const err = validateFile(file);
    expect(err).toMatch(/not allowed/);
  });

  it("rejects files over 10MB", () => {
    const file = makeFile("huge.pdf", "application/pdf", MAX_FILE_SIZE_BYTES + 1);
    const err = validateFile(file);
    expect(err).toMatch(/too large/i);
  });

  it("rejects empty (zero-byte) files", () => {
    const file = makeFile("empty.pdf", "application/pdf", 0);
    expect(validateFile(file)).toMatch(/empty/i);
  });

  it("accepts file exactly at size limit", () => {
    const file = makeFile("limit.pdf", "application/pdf", MAX_FILE_SIZE_BYTES);
    expect(validateFile(file)).toBeNull();
  });

  it("exports the expected accepted MIME list", () => {
    expect(ACCEPTED_MIME_TYPES).toContain("application/pdf");
    expect(ACCEPTED_MIME_TYPES).toContain("image/jpeg");
    expect(ACCEPTED_MIME_TYPES).toContain("image/png");
    expect(ACCEPTED_MIME_TYPES).toContain("image/webp");
  });
});

describe("buildUploadPath", () => {
  it("produces timestamped path with sanitized name", () => {
    const path = buildUploadPath("deals/abc/dd/item-1", "my report.pdf");
    expect(path).toMatch(/^deals\/abc\/dd\/item-1\/\d+-my_report\.pdf$/);
  });

  it("strips leading and trailing slashes from prefix", () => {
    const path = buildUploadPath("/deals/abc/", "file.pdf");
    expect(path).toMatch(/^deals\/abc\/\d+-file\.pdf$/);
  });

  it("sanitizes path traversal and special chars", () => {
    const path = buildUploadPath("deals/x", "../../../etc/passwd");
    expect(path).not.toContain("..");
    expect(path).not.toContain("/etc/passwd");
    expect(path).toMatch(/^deals\/x\/\d+-[_a-zA-Z0-9.-]+$/);
  });

  it("preserves underscores, dots and dashes in filename", () => {
    const path = buildUploadPath("docs", "my_file-v2.final.pdf");
    expect(path).toMatch(/\d+-my_file-v2\.final\.pdf$/);
  });

  it("replaces spaces and unicode with underscores", () => {
    const path = buildUploadPath("docs", "résumé final.pdf");
    expect(path).toMatch(/\d+-r_sum__final\.pdf$/);
  });
});

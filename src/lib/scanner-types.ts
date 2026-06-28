export interface ScanResult {
  barcode: string;
}

export interface ScanError {
  message: string;
  isPermissionError?: boolean;
}

export type ScanEvent = {
  type: "success";
  data: ScanResult;
} |
  { type: "error"; error: ScanError };

export interface ScanResult {
  barcode: string;
}

export interface ScanError {
  message: string;
}

export type ScanEvent = {
  type: "success";
  data: ScanResult;
} |
  { type: "error"; error: ScanError };

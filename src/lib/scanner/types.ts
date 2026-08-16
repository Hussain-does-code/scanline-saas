export type Severity = "critical" | "high" | "medium" | "low";

export interface RawFinding {
  category: string;
  severity: Severity;
  file: string;
  line: number;
  raw_output: string;
}

export interface ScannerPlugin {
  name: string;
  scan(dirPath: string): Promise<RawFinding[]>;
}

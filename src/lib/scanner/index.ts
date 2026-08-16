import { RawFinding } from "./types";
import { SecretsScanner } from "./plugins/secrets";
import { AICodegenScanner } from "./plugins/ai-codegen";

export async function runScan(dirPath: string): Promise<RawFinding[]> {
  const plugins = [SecretsScanner, AICodegenScanner];
  let allFindings: RawFinding[] = [];
  
  for (const plugin of plugins) {
    const findings = await plugin.scan(dirPath);
    allFindings = allFindings.concat(findings);
  }
  
  return allFindings;
}

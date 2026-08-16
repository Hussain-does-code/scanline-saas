import { RawFinding, ScannerPlugin } from "../types";
import fs from "fs/promises";
import path from "path";

const SECRET_PATTERNS = [
  { name: "Hardcoded API Key", regex: /api[_-]?key\s*=\s*['"][a-zA-Z0-9_-]{16,}['"]/i, severity: "high" as const },
  { name: "Database URL", regex: /(postgres|mysql|mongodb)(\+srv)?:\/\/[^:]+:[^@]+@[^/]+/, severity: "critical" as const },
  { name: "Private Key", regex: /-----BEGIN (RSA |OPENSSH |)PRIVATE KEY-----/, severity: "critical" as const },
];

async function walk(dir: string, fileList: string[] = []): Promise<string[]> {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (file === "node_modules" || file === ".git" || file === ".next") continue;
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      fileList = await walk(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

export const SecretsScanner: ScannerPlugin = {
  name: "Secrets Scanner",
  async scan(dirPath: string) {
    const findings: RawFinding[] = [];
    const files = await walk(dirPath);
    
    for (const file of files) {
      if (!file.match(/\.(ts|js|tsx|jsx|json|env|md)$/)) continue;
      
      try {
        const content = await fs.readFile(file, "utf8");
        const lines = content.split('\n');
        
        lines.forEach((lineStr, index) => {
          for (const pattern of SECRET_PATTERNS) {
            const match = lineStr.match(pattern.regex);
            if (match) {
              findings.push({
                category: pattern.name,
                severity: pattern.severity,
                file: path.relative(dirPath, file).replace(/\\/g, '/'),
                line: index + 1,
                raw_output: `Matched pattern ${pattern.name}`,
              });
            }
          }
        });
      } catch (e) {
        // Skip unreadable files
      }
    }
    
    return findings;
  }
}

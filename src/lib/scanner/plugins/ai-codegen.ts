import { RawFinding, ScannerPlugin } from "../types";
import fs from "fs/promises";
import path from "path";

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

export const AICodegenScanner: ScannerPlugin = {
  name: "AI Codegen Scanner",
  async scan(dirPath: string) {
    const findings: RawFinding[] = [];
    const files = await walk(dirPath);
    
    for (const file of files) {
      if (!file.match(/\.(ts|js|tsx|jsx)$/)) continue;
      const relPath = path.relative(dirPath, file).replace(/\\/g, '/');
      
      try {
        const content = await fs.readFile(file, "utf8");
        const lines = content.split('\n');
        
        lines.forEach((lineStr, index) => {
          // Check for Wildcard CORS
          if (lineStr.match(/Access-Control-Allow-Origin.*?['"]\*['"]/i)) {
            findings.push({ category: "Wildcard CORS", severity: "high", file: relPath, line: index + 1, raw_output: "Wildcard CORS allowed" });
          }
          
          // Check for NEXT_PUBLIC secrets
          if (lineStr.match(/NEXT_PUBLIC_.*?(SECRET|KEY|PASSWORD|TOKEN)/i)) {
            findings.push({ category: "Client-side Secret", severity: "critical", file: relPath, line: index + 1, raw_output: "Secret exposed to client via NEXT_PUBLIC" });
          }
          
          // Check for raw SQL interpolation (naive regex for MVP)
          if (lineStr.match(/SELECT.*?FROM.*?WHERE.*?\$\{/i)) {
            findings.push({ category: "SQL Injection Risk", severity: "critical", file: relPath, line: index + 1, raw_output: "String interpolation used in SQL query" });
          }
        });
        
        // File-level checks
        if (relPath.includes("api/login") || relPath.includes("api/auth")) {
          if (!content.includes("rateLimit") && !content.includes("upstash")) {
             findings.push({ category: "Missing Rate Limit", severity: "medium", file: relPath, line: 1, raw_output: "No rate limit detected on auth route" });
          }
        }
      } catch (_e) {
        // Skip
      }
    }
    return findings;
  }
}

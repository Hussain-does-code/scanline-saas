"use client";
import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Copy } from "lucide-react"
import { Badge } from "./badge"
import { Button } from "./button"
import { motion, AnimatePresence } from "framer-motion"

export interface Finding {
  id: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  file: string;
  line: number;
  plain_explanation: string;
  risk_scenario: string;
  fix_prompt: string;
  raw_output?: string;
  repoName?: string;
  status: "new" | "persisting" | "fixed" | "accepted";
}

interface FindingRowProps extends React.HTMLAttributes<HTMLDivElement> {
  finding: Finding;
  onCopyFix?: (id: string, prompt: string) => void;
  onAcceptRisk?: (id: string) => void;
}

export function FindingRow({ finding, onCopyFix, onAcceptRisk, className, ...props }: FindingRowProps) {
  const [expanded, setExpanded] = React.useState(false);

  const getSeverityBadge = (severity: Finding["severity"]) => {
    switch (severity) {
      case "critical": return <Badge variant="danger">Critical</Badge>;
      case "high": return <Badge variant="danger">High</Badge>;
      case "medium": return <Badge variant="warning">Medium</Badge>;
      case "low": return <Badge variant="outline">Low</Badge>;
    }
  };

  return (
    <div 
      className={cn(
        "group border-2 border-black bg-panel rounded-lg overflow-hidden transition-all shadow-comic",
        finding.status === "fixed" ? "opacity-50" : "",
        className
      )}
      {...props}
    >
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-4">
          {getSeverityBadge(finding.severity)}
          <span className={cn("font-serif font-semibold text-fog text-base", finding.status === "fixed" ? "line-through text-mist" : "")}>
            {finding.category}
          </span>
          <span className="font-mono text-xs text-mist hidden md:inline-flex items-center">
            {finding.repoName && <span className="text-fog/80 mr-2 px-2 py-0.5 bg-black/60 border border-zinc-700 rounded text-xs">{finding.repoName}</span>}
            {finding.file}:{finding.line}
          </span>
        </div>
        <div className="flex items-center space-x-4 text-mist">
          {finding.status === "new" && <Badge variant="outline" className="text-zinc-200 border-zinc-600 bg-zinc-800/80">New</Badge>}
          {finding.status === "fixed" && <Badge variant="success">Fixed</Badge>}
          <ChevronDown className={cn("h-4 w-4 transition-transform text-mist", expanded ? "rotate-180" : "")} />
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t-2 border-black bg-black/40"
          >
            <div className="p-5 space-y-4 font-serif">
              {finding.raw_output && (
                <div>
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-mist mb-1.5">Source Code Location</h4>
                  <pre className="text-xs bg-black border border-zinc-700 p-3 rounded overflow-x-auto text-zinc-200 font-mono">
                    {finding.raw_output}
                  </pre>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-semibold text-fog mb-1">What this is</h4>
                <p className="text-sm text-mist leading-relaxed">{finding.plain_explanation}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-fog mb-1">The risk</h4>
                <p className="text-sm text-mist leading-relaxed">{finding.risk_scenario}</p>
              </div>
              
              <div className="flex items-center space-x-3 pt-2">
                <Button 
                  size="sm" 
                  className="bg-black text-white hover:bg-zinc-900 font-bold border-2 border-black shadow-comic-white hover:shadow-comic-white-hover transition-all duration-200 font-serif"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(finding.fix_prompt);
                    onCopyFix?.(finding.id, finding.fix_prompt);
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Fix Prompt
                </Button>
                
                {finding.status !== "fixed" && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-mist hover:text-fog font-serif"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAcceptRisk?.(finding.id);
                    }}
                  >
                    Accept Risk
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

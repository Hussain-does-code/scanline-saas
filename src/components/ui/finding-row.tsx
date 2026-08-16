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
        "group border border-mist/20 bg-panel rounded-lg overflow-hidden transition-all",
        finding.status === "fixed" ? "opacity-50" : "",
        className
      )}
      {...props}
    >
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-mist/5"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-4">
          {getSeverityBadge(finding.severity)}
          <span className={cn("font-medium text-fog", finding.status === "fixed" ? "line-through text-mist" : "")}>
            {finding.category}
          </span>
          <span className="font-mono text-sm text-mist hidden md:inline-flex">
            {finding.file}:{finding.line}
          </span>
        </div>
        <div className="flex items-center space-x-4 text-mist">
          {finding.status === "new" && <Badge variant="outline" className="text-scanline border-scanline/30 bg-scanline/5">New</Badge>}
          {finding.status === "fixed" && <Badge variant="success">Fixed</Badge>}
          <ChevronDown className={cn("h-4 w-4 transition-transform", expanded ? "rotate-180" : "")} />
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-mist/10 bg-ink/30"
          >
            <div className="p-4 space-y-4">
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
                  className="bg-scanline text-ink hover:bg-scanline/90"
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
                    className="text-mist hover:text-fog"
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

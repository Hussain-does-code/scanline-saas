"use client";
import * as React from "react";
import { ScanSweep } from "@/components/ui/scan-sweep";
import { ScoreReadout } from "@/components/ui/score-readout";
import { FindingRow, Finding } from "@/components/ui/finding-row";
import { Button } from "@/components/ui/button";

export function DashboardClient({ 
  initialFindings,
  initialScore
}: { 
  initialFindings: Finding[];
  initialScore?: number;
}) {
  const [isScanning, setIsScanning] = React.useState(false);
  const [findings, setFindings] = React.useState<Finding[]>(initialFindings);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const calculateScore = React.useCallback((items: Finding[]) => {
    const openCount = items.filter(f => f.status !== 'fixed' && f.status !== 'accepted').length;
    return Math.max(0, 100 - openCount * 5);
  }, []);

  const [score, setScore] = React.useState<number>(
    initialScore !== undefined ? initialScore : calculateScore(initialFindings)
  );

  const handleRescan = async () => {
    setIsScanning(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/scan", { method: "POST" });
      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        setErrorMessage(data?.error || "Failed to complete scan. Please try again.");
      } else if (data.findings) {
        setFindings(data.findings);
        if (data.score !== undefined) {
          setScore(data.score);
        } else {
          setScore(calculateScore(data.findings));
        }
      }
    } catch (e: any) {
      console.error("Scan trigger error:", e);
      setErrorMessage(e?.message || "An unexpected error occurred during scanning.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleCopyFix = (_id: string, _prompt: string) => {
    // Analytics/telemetry hook
  };

  const handleAcceptRisk = (id: string) => {
    const updated = findings.map(f => f.id === id ? { ...f, status: "accepted" as const } : f);
    setFindings(updated);
    setScore(calculateScore(updated));
  };

  const openFindingsCount = findings.filter(f => f.status !== 'fixed' && f.status !== 'accepted').length;

  return (
    <>
      <div className="absolute top-4 right-4 z-50">
        <Button variant="outline" size="sm" onClick={handleRescan} disabled={isScanning}>
          {isScanning ? "Scanning..." : "Rescan"}
        </Button>
      </div>
      
      <ScanSweep isScanning={isScanning}>
        <main className="flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full space-y-8">
          {isScanning && (
            <div className="flex items-center justify-center p-4 bg-panel border-2 border-black rounded shadow-comic">
              <div className="text-fog font-mono text-sm animate-pulse">
                Cloning latest repository... Analyzing security vulnerabilities... Generating plain English fixes...
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-panel border-2 border-black shadow-comic rounded text-rose-400 text-sm flex items-center justify-between font-serif">
              <span>{errorMessage}</span>
              <Button variant="ghost" size="sm" onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white">
                Dismiss
              </Button>
            </div>
          )}
          
          {findings.length === 0 && !isScanning ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center pt-12">
              <div className="max-w-md space-y-6 bg-panel p-8 rounded-lg border-2 border-black shadow-comic relative overflow-hidden">
                <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-700">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-fog font-serif">Ready for your first scan?</h2>
                <p className="text-mist text-sm leading-relaxed font-serif">
                  Scanline will securely analyze your most recent GitHub repository for AI-generated vulnerabilities.
                </p>
                <Button onClick={handleRescan} className="w-full bg-black text-white hover:bg-zinc-900 font-bold h-12 font-serif border-2 border-black shadow-comic-white hover:shadow-comic-white-hover transition-all duration-200">
                  Start Scanning
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="pt-4">
                <ScoreReadout score={score} streak={12} className="py-4 transition-all duration-500" />
              </div>
              
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-zinc-950 font-serif">Findings ({openFindingsCount} open)</h2>
                  {findings.length > 0 && (
                    <span className="text-xs text-zinc-950/80 font-mono font-medium">
                      {findings.length} total findings recorded
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {findings.map(finding => (
                    <FindingRow 
                      key={finding.id} 
                      finding={finding} 
                      onCopyFix={handleCopyFix}
                      onAcceptRisk={handleAcceptRisk}
                    />
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
      </ScanSweep>
    </>
  );
}

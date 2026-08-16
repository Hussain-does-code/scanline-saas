"use client";
import * as React from "react";
import { ScanSweep } from "@/components/ui/scan-sweep";
import { ScoreReadout } from "@/components/ui/score-readout";
import { FindingRow, Finding } from "@/components/ui/finding-row";
import { Button } from "@/components/ui/button";

export function DashboardClient({ initialFindings }: { initialFindings: Finding[] }) {
  const [isScanning, setIsScanning] = React.useState(false);
  const [findings, setFindings] = React.useState<Finding[]>(initialFindings);
  const [score, setScore] = React.useState(0);

  React.useEffect(() => {
    if (isScanning) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScore(0); // Reset score while scanning
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScore(94); // Mock final score
    }
  }, [isScanning]);

  const handleRescan = async () => {
    setIsScanning(true);
    try {
      const response = await fetch("/api/scan", { method: "POST" });
      if (response.ok) {
        const result = await response.json();
        if (result.findings) {
          setFindings(result.findings);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyFix = (_id: string, _prompt: string) => {
    // In a real app, track copied state or analytics
  };

  const handleAcceptRisk = (id: string) => {
    setFindings(findings.map(f => f.id === id ? { ...f, status: "accepted" } : f));
  };

  return (
    <>
      <div className="absolute top-4 right-4 z-50">
        <Button variant="outline" size="sm" onClick={handleRescan} disabled={isScanning}>
          {isScanning ? "Scanning..." : "Rescan"}
        </Button>
      </div>
      
      <ScanSweep isScanning={isScanning} onComplete={() => setIsScanning(false)}>
        <main className="flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full space-y-12">
          {isScanning && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 text-scanline font-mono text-sm animate-pulse z-50">
              Cloning repository... Analyzing code...
            </div>
          )}
          
          {findings.length === 0 && !isScanning ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center pt-12">
              <div className="max-w-md space-y-6 bg-panel p-8 rounded border-2 border-scanline shadow-comic relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-scanline/10 to-transparent pointer-events-none" />
                <div className="w-16 h-16 bg-scanline/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-scanline/20">
                  <svg className="w-8 h-8 text-scanline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-fog relative z-10">Ready for your first scan?</h2>
                <p className="text-mist text-sm leading-relaxed relative z-10">
                  Scanline will securely analyze your most recent GitHub repository for AI-generated vulnerabilities.
                </p>
                <Button onClick={handleRescan} className="w-full bg-scanline text-ink hover:bg-scanline/90 font-bold h-12 relative z-10 shadow-comic hover:shadow-comic-hover transition-all duration-200">
                  Start Scanning
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="pt-8">
                <ScoreReadout score={score} streak={12} className="py-8 transition-all duration-1000" />
              </div>
              
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium text-fog">Findings ({findings.filter(f => f.status !== 'fixed' && f.status !== 'accepted').length} open)</h2>
                </div>
                <div className="space-y-2">
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

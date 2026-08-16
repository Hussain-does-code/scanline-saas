"use client";
import * as React from "react";
import { ScanSweep } from "@/components/ui/scan-sweep";
import { ScoreReadout } from "@/components/ui/score-readout";
import { FindingRow, Finding } from "@/components/ui/finding-row";
import { Button } from "@/components/ui/button";

export function DashboardClient({ initialFindings }: { initialFindings: Finding[] }) {
  const [isScanning, setIsScanning] = React.useState(true);
  const [findings, setFindings] = React.useState<Finding[]>(initialFindings);
  const [score, setScore] = React.useState(0);

  React.useEffect(() => {
    if (isScanning) {
      setScore(0); // Reset score while scanning
    } else {
      setScore(94); // Mock final score
    }
  }, [isScanning]);

  const handleRescan = () => {
    setIsScanning(true);
  };

  const handleCopyFix = (id: string, prompt: string) => {
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
              Checking for exposed keys... Checking authentication...
            </div>
          )}
          
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
        </main>
      </ScanSweep>
    </>
  );
}

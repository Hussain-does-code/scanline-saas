"use client";
import * as React from "react";

export function ScanSweep({ 
  isScanning, 
  children 
}: { 
  isScanning: boolean;
  onComplete?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full h-full">
      {isScanning && (
        <div 
          aria-hidden="true"
          className="pointer-events-none absolute left-0 right-0 z-50 h-[2px] bg-scanline shadow-[0_0_20px_4px_#E67E22] animate-scan-beam" 
        />
      )}
      <div 
        className={`h-full transition-opacity duration-300 ${
          isScanning ? "opacity-40 grayscale pointer-events-none select-none" : "opacity-100 grayscale-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

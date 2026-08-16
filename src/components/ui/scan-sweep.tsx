"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ScanSweep({ isScanning, onComplete, children }: { isScanning: boolean, onComplete?: () => void, children: React.ReactNode }) {
  
  React.useEffect(() => {
    if (isScanning) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000); // 3 seconds scan time
      return () => clearTimeout(timer);
    }
  }, [isScanning, onComplete]);

  return (
    <div className="relative w-full h-full">
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ top: 0 }}
            animate={{ top: "100%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: "linear" }}
            className="pointer-events-none absolute left-0 right-0 z-50 h-[2px] bg-scanline shadow-[0_0_20px_4px_#5EEAD4]"
          />
        )}
      </AnimatePresence>
      <motion.div
        initial={isScanning ? { filter: "grayscale(100%) opacity(0.2)" } : false}
        animate={{ filter: "grayscale(0%) opacity(1)" }}
        transition={{ duration: 3, ease: "linear" }}
        className="h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}

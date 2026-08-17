"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

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
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ top: "0%" }}
            animate={{ top: ["0%", "100%", "0%"] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute left-0 right-0 z-50 h-[2px] bg-scanline shadow-[0_0_20px_4px_#E67E22]"
          />
        )}
      </AnimatePresence>
      <motion.div
        animate={isScanning ? { filter: "grayscale(60%) opacity(0.5)" } : { filter: "grayscale(0%) opacity(1)" }}
        transition={{ duration: 0.4 }}
        className="h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Crosshair, RotateCcw } from "lucide-react";
import type { CodmScanPhase } from "@/hooks/useCodmPingTest";

export function CodmScanButton({ phase, onStart }: { phase: CodmScanPhase; onStart: () => void }) {
  const scanning = phase === "scanning";
  const finished = phase === "done" || phase === "error";

  return (
    <motion.button
      onClick={onStart}
      disabled={scanning}
      whileHover={scanning ? undefined : { scale: 1.03 }}
      whileTap={scanning ? undefined : { scale: 0.97 }}
      className="group relative flex h-40 w-40 items-center justify-center rounded-full disabled:cursor-not-allowed sm:h-48 sm:w-48"
    >
      {!scanning && <span className="absolute inset-0 animate-pulse-glow-codm rounded-full" />}
      <span
        className="absolute inset-0 rounded-full opacity-90 shadow-2xl shadow-rose-500/30 transition-opacity group-disabled:opacity-40"
        style={{
          background: "conic-gradient(from 180deg, #38bdf8, #f43f5e, #38bdf8)",
        }}
      />
      <span className="absolute inset-[3px] rounded-full bg-black" />
      <span className="relative flex flex-col items-center gap-1 text-white">
        {finished ? <RotateCcw size={26} /> : <Crosshair size={26} className={scanning ? "animate-spin" : ""} />}
        <span className="text-sm font-semibold tracking-wide">
          {finished ? "Scan Again" : scanning ? "Scanning…" : "SCAN"}
        </span>
      </span>
    </motion.button>
  );
}

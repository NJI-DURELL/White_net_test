"use client";

import { motion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";
import type { TestPhase } from "@/lib/types";

export function GoButton({
  phase,
  onStart,
}: {
  phase: TestPhase;
  onStart: () => void;
}) {
  const running = phase === "ping" || phase === "download" || phase === "upload";
  const finished = phase === "done" || phase === "error";

  return (
    <motion.button
      layoutId="go-button"
      onClick={onStart}
      disabled={running}
      whileHover={running ? undefined : { scale: 1.03 }}
      whileTap={running ? undefined : { scale: 0.97 }}
      className="group relative flex h-40 w-40 items-center justify-center rounded-full disabled:cursor-not-allowed sm:h-48 sm:w-48"
    >
      {!running && (
        <span className="animate-pulse-glow absolute inset-0 rounded-full" />
      )}
      <span
        className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 opacity-90 shadow-2xl shadow-sky-500/30 transition-opacity group-disabled:opacity-40"
      />
      <span className="relative flex flex-col items-center gap-1 text-white">
        {finished ? <RotateCcw size={26} /> : <Play size={26} fill="white" />}
        <span className="text-sm font-semibold tracking-wide">
          {finished ? "Test Again" : running ? "Testing…" : "GO"}
        </span>
      </span>
    </motion.button>
  );
}

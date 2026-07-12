"use client";

import { motion } from "framer-motion";
import { Target } from "lucide-react";
import type { CodmRecommendation } from "@/lib/codm/recommendations";

const toneColor: Record<CodmRecommendation["tone"], string> = {
  good: "#34d399",
  warn: "#fbbf24",
  bad: "#f87171",
  neutral: "#38bdf8",
};

export function CodmRecommendations({ recommendations }: { recommendations: CodmRecommendation[] }) {
  if (recommendations.length === 0) return null;

  return (
    <div className="glass flex flex-col gap-3 rounded-2xl border border-white/10 p-4">
      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/50">
        <Target size={13} /> CODM Recommendations
      </span>
      <div className="flex flex-col gap-2.5">
        {recommendations.map((rec, i) => (
          <motion.div
            key={rec.title}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="flex gap-2.5 rounded-lg border-l-2 bg-white/[0.03] px-3 py-2"
            style={{ borderColor: toneColor[rec.tone] }}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-white/90">{rec.title}</span>
              <span className="text-xs leading-relaxed text-white/50">{rec.detail}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

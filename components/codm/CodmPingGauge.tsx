"use client";

import { motion } from "framer-motion";
import { CODM_TIERS } from "@/lib/codm/scoring";
import type { CodmTier } from "@/lib/codm/types";

/** CODM's own in-game ping HUD reads 0 (best) to 200ms (worst) — mirrored here. */
const CODM_SCALE_MAX = 200;

export function CodmPingGauge({ pingMs, tier }: { pingMs: number; tier: CodmTier }) {
  const clamped = Math.min(pingMs, CODM_SCALE_MAX);
  const fillPct = (clamped / CODM_SCALE_MAX) * 100;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-baseline gap-2">
        <span className="tabular text-6xl font-black tracking-tight text-white sm:text-7xl" style={{ color: tier.color }}>
          {pingMs >= CODM_SCALE_MAX ? "200+" : Math.round(pingMs)}
        </span>
        <span className="text-lg font-semibold text-white/50">ms</span>
      </div>
      <span
        className="rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest"
        style={{ color: tier.color, borderColor: `${tier.color}55`, backgroundColor: `${tier.color}1a` }}
      >
        {tier.label}
      </span>

      <div className="relative mt-2 h-2.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
        <div className="absolute inset-0 flex">
          {CODM_TIERS.map((t, i) => (
            <div
              key={t.label}
              className="h-full flex-1"
              style={{
                background: t.color,
                opacity: 0.28,
                borderRight: i < CODM_TIERS.length - 1 ? "1px solid rgba(0,0,0,0.4)" : undefined,
              }}
            />
          ))}
        </div>
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: tier.color, boxShadow: `0 0 12px ${tier.color}` }}
          initial={{ width: 0 }}
          animate={{ width: `${fillPct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="flex w-full max-w-xs justify-between text-[10px] text-white/40">
        <span>0</span>
        <span>200ms</span>
      </div>
    </div>
  );
}

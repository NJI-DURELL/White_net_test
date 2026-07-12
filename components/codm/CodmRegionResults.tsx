"use client";

import { motion } from "framer-motion";
import { Crown, Loader2, WifiOff } from "lucide-react";
import { getCodmTier } from "@/lib/codm/scoring";
import { TooltipWrap } from "@/components/ui/Tooltip";
import type { RegionProbeResult } from "@/lib/codm/types";
import { CODM_REGIONS } from "@/lib/codm/regions";

export function CodmRegionResults({
  regions,
  scanning,
  bestRegionId,
}: {
  regions: RegionProbeResult[];
  scanning: boolean;
  bestRegionId?: string | null;
}) {
  const byId = new Map(regions.map((r) => [r.regionId, r]));

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
      {CODM_REGIONS.map((region, i) => {
        const result = byId.get(region.id);
        const isBest = bestRegionId === region.id;
        const tier = result?.status === "ok" && result.codmPingMs != null ? getCodmTier(result.codmPingMs) : null;

        return (
          <motion.div
            key={region.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="glass relative flex flex-col gap-1.5 rounded-xl border p-3"
            style={{
              borderColor: isBest ? "rgba(52,211,153,0.5)" : undefined,
              boxShadow: isBest ? "0 0 18px rgba(52,211,153,0.15)" : undefined,
            }}
          >
            {isBest && (
              <span className="absolute -top-2 right-2 flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                <Crown size={10} /> BEST
              </span>
            )}
            <TooltipWrap text={region.note}>
              <span className="text-xs font-semibold text-white/70">{region.shortLabel}</span>
            </TooltipWrap>

            {!result && scanning ? (
              <span className="flex items-center gap-1.5 text-xs text-white/40">
                <Loader2 size={12} className="animate-spin" /> Probing…
              </span>
            ) : !result ? (
              <span className="text-xs text-white/30">—</span>
            ) : result.status === "unreachable" ? (
              <span className="flex items-center gap-1.5 text-xs text-white/40">
                <WifiOff size={12} /> Unreachable
              </span>
            ) : (
              <>
                <span className="tabular text-xl font-bold" style={{ color: tier?.color }}>
                  {result.codmPingMs}
                  <span className="ml-0.5 text-xs font-medium text-white/40">ms</span>
                </span>
                <span className="text-[10px] text-white/35">
                  jitter {result.jitterMs.toFixed(0)}ms · loss {result.lossPct.toFixed(0)}%
                </span>
              </>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

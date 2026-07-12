"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { readIspHistory, summarizeByIsp, type CodmIspSummary } from "@/lib/codm/ispHistory";
import { getCodmTier } from "@/lib/codm/scoring";

/**
 * Comparing MTN vs Orange vs Camtel vs Starlink for CODM needs testing on
 * each network — one snapshot can't tell you that upfront. This table is
 * the payoff: every scan is remembered per-ISP so the comparison builds
 * itself as the gamer tries different networks over time.
 */
export function CodmIspHistoryTable({ refreshKey }: { refreshKey: number }) {
  const [rows, setRows] = useState<CodmIspSummary[]>([]);

  useEffect(() => {
    setRows(summarizeByIsp(readIspHistory()));
  }, [refreshKey]);

  if (rows.length === 0) return null;

  return (
    <div className="glass flex flex-col gap-3 rounded-2xl border border-white/10 p-4">
      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/50">
        <Trophy size={13} /> Your ISP Comparison
      </span>
      <div className="flex flex-col gap-1.5">
        {rows.map((row, i) => {
          const tier = getCodmTier(row.bestCodmPingMs);
          return (
            <div
              key={row.ispName}
              className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                {i === 0 && <span className="text-xs">🏆</span>}
                <span className="font-medium text-white/85">{row.ispName}</span>
                <span className="text-[10px] text-white/35">
                  {row.timesTested}x tested
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/35">{row.bestRegionLabel.split(" (")[0]}</span>
                <span className="tabular text-sm font-bold" style={{ color: tier.color }}>
                  {row.bestCodmPingMs}ms
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

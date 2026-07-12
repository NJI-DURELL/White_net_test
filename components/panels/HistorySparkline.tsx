"use client";

import { useMemo, useState } from "react";
import { History } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { HistoryEntry } from "@/lib/types";

export function HistorySparkline({ history }: { history: HistoryEntry[] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const { path, points } = useMemo(() => {
    if (history.length < 2) return { path: "", points: [] as { x: number; y: number }[] };
    const max = Math.max(...history.map((h) => h.downloadMBps), 1);
    const pts = history.map((h, i) => ({
      x: (i / (history.length - 1)) * 100,
      y: 32 - (h.downloadMBps / max) * 28,
    }));
    const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    return { path: d, points: pts };
  }, [history]);

  if (history.length === 0) {
    return (
      <Card className="flex flex-col gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-current/50">
          <History size={14} />
          Recent Tests
        </span>
        <p className="text-xs text-current/35">Run a test to start building your history.</p>
      </Card>
    );
  }

  const active = hoverIdx !== null ? history[hoverIdx] : history[history.length - 1];

  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-medium text-current/50">
          <History size={14} />
          Recent Tests
        </span>
        <span className="text-xs font-medium tabular text-current/70">
          {active.downloadMBps.toFixed(1)} MB/s
        </span>
      </div>
      <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="h-10 w-full">
        {path && (
          <path d={path} fill="none" stroke="#818cf8" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        )}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hoverIdx === i ? 2 : 1}
            fill="#818cf8"
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
          />
        ))}
      </svg>
      <span className="text-[10px] text-current/35">
        {new Date(active.timestamp).toLocaleString()} · {active.strengthLabel}
      </span>
    </Card>
  );
}

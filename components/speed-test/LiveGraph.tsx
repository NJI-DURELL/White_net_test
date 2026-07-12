"use client";

import { useMemo } from "react";
import { useId } from "react";
import type { GraphPoint } from "@/hooks/useSpeedTest";

const WIDTH = 100;
const HEIGHT = 100;
const WINDOW_MS = 8000;

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const midX = (curr.x + next.x) / 2;
    const midY = (curr.y + next.y) / 2;
    d += ` Q ${curr.x} ${curr.y} ${midX} ${midY}`;
  }
  const last = points[points.length - 1];
  d += ` T ${last.x} ${last.y}`;
  return d;
}

export function LiveGraph({ points, maxValue }: { points: GraphPoint[]; maxValue: number }) {
  const gradientId = useId();

  const { linePath, areaPath } = useMemo(() => {
    if (points.length < 2 || maxValue <= 0) return { linePath: "", areaPath: "" };

    const latestT = points[points.length - 1].t;
    const windowStart = latestT - WINDOW_MS;
    const visible = points.filter((p) => p.t >= windowStart);
    if (visible.length < 2) return { linePath: "", areaPath: "" };

    const mapped = visible.map((p) => ({
      x: ((p.t - windowStart) / WINDOW_MS) * WIDTH,
      y: HEIGHT - Math.min(p.value / maxValue, 1) * HEIGHT,
    }));

    const line = buildSmoothPath(mapped);
    const first = mapped[0];
    const last = mapped[mapped.length - 1];
    const area = `${line} L ${last.x} ${HEIGHT} L ${first.x} ${HEIGHT} Z`;

    return { linePath: line, areaPath: area };
  }, [points, maxValue]);

  return (
    <div className="h-24 w-full overflow-hidden rounded-xl">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
        </defs>
        {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
}

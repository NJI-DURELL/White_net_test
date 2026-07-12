"use client";

import { useId } from "react";
import { motion, useTransform } from "framer-motion";
import { useAnimatedValue } from "@/hooks/useAnimatedValue";
import { AnimatedNumber } from "./AnimatedNumber";
import { unitLabel, type SpeedUnit } from "@/lib/units";

const SIZE = 280;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function SpeedGauge({
  bytesPerSec,
  displayValue,
  maxBytesPerSec,
  unit,
  phaseLabel,
}: {
  bytesPerSec: number;
  displayValue: number;
  maxBytesPerSec: number;
  unit: SpeedUnit;
  phaseLabel: string;
}) {
  const gradientId = useId();
  const smoothed = useAnimatedValue(Math.min(bytesPerSec, maxBytesPerSec));
  const offset = useTransform(smoothed, (v) => {
    const fraction = maxBytesPerSec > 0 ? Math.min(v / maxBytesPerSec, 1) : 0;
    return CIRCUMFERENCE * (1 - fraction);
  });

  return (
    <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="55%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-current/[0.06]"
        />
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          style={{ strokeDashoffset: offset }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-current/40">
          {phaseLabel}
        </span>
        <div className="flex items-baseline gap-1.5 tabular">
          <AnimatedNumber value={displayValue} className="text-5xl font-bold tracking-tight" />
          <span className="text-base font-medium text-current/50">{unitLabel(unit)}</span>
        </div>
      </div>
    </div>
  );
}

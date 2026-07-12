"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Gauge, Waves } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TooltipWrap } from "@/components/ui/Tooltip";
import { formatSpeed, unitLabel, type SpeedUnit } from "@/lib/units";
import type { TestResult } from "@/lib/types";

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function ResultsSummary({ result, unit }: { result: TestResult; unit: SpeedUnit }) {
  const metrics = [
    {
      icon: ArrowDown,
      label: "Download",
      value: formatSpeed(result.downloadBytesPerSec, unit),
      suffix: unitLabel(unit),
    },
    {
      icon: ArrowUp,
      label: "Upload",
      value: formatSpeed(result.uploadBytesPerSec, unit),
      suffix: unitLabel(unit),
    },
    {
      icon: Gauge,
      label: "Ping",
      value: result.ping.avgMs.toFixed(0),
      suffix: "ms",
    },
    {
      icon: Waves,
      label: "Jitter",
      value: result.ping.jitterMs.toFixed(0),
      suffix: "ms",
      tooltip: "Variation in ping over time — lower is more stable, better for calls and gaming.",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {metrics.map((m, i) => (
        <motion.div key={m.label} custom={i} variants={cardVariants} initial="hidden" animate="show">
          <Card className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-current/40">
              <m.icon size={16} />
              {m.tooltip && <TooltipWrap text={m.tooltip}>{null}</TooltipWrap>}
            </div>
            <div className="flex items-baseline gap-1 tabular">
              <span className="text-2xl font-bold">{m.value}</span>
              <span className="text-xs text-current/50">{m.suffix}</span>
            </div>
            <span className="text-xs font-medium text-current/50">{m.label}</span>
          </Card>
        </motion.div>
      ))}
      <motion.div custom={4} variants={cardVariants} initial="hidden" animate="show" className="col-span-2 sm:col-span-4">
        <Card className="flex items-center justify-between">
          <span className="text-xs font-medium text-current/50">Estimated Packet Loss</span>
          <span className="text-sm font-semibold tabular">{result.ping.packetLossPct.toFixed(1)}%</span>
        </Card>
      </motion.div>
    </div>
  );
}

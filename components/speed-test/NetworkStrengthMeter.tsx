"use client";

import { motion } from "framer-motion";
import { SignalHigh } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TooltipWrap } from "@/components/ui/Tooltip";
import { STRENGTH_LABELS } from "@/lib/constants";
import type { StrengthResult } from "@/lib/types";

export function NetworkStrengthMeter({ strength }: { strength: StrengthResult }) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <TooltipWrap text="Not a WiFi signal reading — browsers can't access radio hardware. This is a synthesized quality score combining your measured speed, ping, jitter and packet loss.">
          <span className="flex items-center gap-1.5 text-xs font-medium text-current/50">
            <SignalHigh size={14} />
            Network Strength
          </span>
        </TooltipWrap>
        <span className="text-sm font-bold" style={{ color: colorFor(strength.label) }}>
          {strength.label}
        </span>
      </div>

      <div className="flex gap-1.5">
        {STRENGTH_LABELS.slice()
          .reverse()
          .map((tier, i) => {
            const active = strength.score >= tier.min;
            return (
              <motion.div
                key={tier.label}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="h-2 flex-1 origin-bottom rounded-full"
                style={{
                  backgroundColor: active ? colorFor(strength.label) : "rgb(var(--text-1) / 0.15)",
                }}
              />
            );
          })}
      </div>

      <div className="mt-2 flex justify-between text-[10px] text-current/35">
        <span>Very Weak</span>
        <span>Excellent</span>
      </div>
    </Card>
  );
}

function colorFor(label: string): string {
  switch (label) {
    case "Excellent":
    case "Good":
      return "#34d399";
    case "Fair":
      return "#fbbf24";
    default:
      return "#f87171";
  }
}

"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import type { TestPhase } from "@/lib/types";

const STEPS: { key: TestPhase; label: string }[] = [
  { key: "ping", label: "Ping" },
  { key: "download", label: "Download" },
  { key: "upload", label: "Upload" },
];

function stepStatus(step: TestPhase, phase: TestPhase): "pending" | "active" | "done" {
  const order: TestPhase[] = ["ping", "download", "upload", "done"];
  const stepIdx = order.indexOf(step);
  const phaseIdx = order.indexOf(phase === "error" ? "done" : phase);
  if (phaseIdx > stepIdx) return "done";
  if (phaseIdx === stepIdx) return "active";
  return "pending";
}

export function PhaseIndicator({ phase }: { phase: TestPhase }) {
  return (
    <div className="flex items-center gap-3">
      {STEPS.map((step, i) => {
        const status = stepStatus(step.key, phase);
        return (
          <div key={step.key} className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span
                className={clsx(
                  "flex h-5 w-5 items-center justify-center rounded-full border text-[10px]",
                  status === "done" && "border-emerald-400/40 bg-emerald-400/15 text-emerald-300",
                  status === "active" && "border-sky-400/40 bg-sky-400/15 text-sky-300",
                  status === "pending" && "border-current/15 text-current/30"
                )}
              >
                {status === "done" ? (
                  <Check size={11} />
                ) : status === "active" ? (
                  <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Loader2 size={11} />
                  </motion.span>
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={clsx(
                  "text-xs font-medium",
                  status === "pending" ? "text-current/30" : "text-current/70"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && <span className="h-px w-6 bg-current/10" />}
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSpeedTest } from "@/hooks/useSpeedTest";
import { SpeedGauge } from "./SpeedGauge";
import { LiveGraph } from "./LiveGraph";
import { GoButton } from "./GoButton";
import { PhaseIndicator } from "./PhaseIndicator";
import { UnitToggle } from "./UnitToggle";
import { ResultsSummary } from "./ResultsSummary";
import { StreamingRating } from "./StreamingRating";
import { NetworkStrengthMeter } from "./NetworkStrengthMeter";
import { ISPPanel } from "@/components/panels/ISPPanel";
import { DeviceInfoCard } from "@/components/panels/DeviceInfoCard";
import { HistorySparkline } from "@/components/panels/HistorySparkline";
import { ResultCard } from "@/components/share/ResultCard";
import { bytesPerSecToMBps, bytesPerSecToMbps, type SpeedUnit } from "@/lib/units";

const GAUGE_FLOOR_BYTES_PER_SEC = 12_500_000; // ~100 Mbps starting scale

const phaseCopy: Record<string, string> = {
  idle: "Ready",
  ping: "Checking latency",
  download: "Download",
  upload: "Upload",
  done: "Complete",
  error: "Error",
};

export function TestOrchestrator() {
  const { phase, liveBytesPerSec, graphPoints, ping, ipInfo, result, error, history, start, cancel } = useSpeedTest();
  const [unit, setUnit] = useState<SpeedUnit>("MBps");
  const gaugeMaxRef = useRef(GAUGE_FLOOR_BYTES_PER_SEC);

  useEffect(() => {
    if (liveBytesPerSec > gaugeMaxRef.current * 0.92) {
      gaugeMaxRef.current = liveBytesPerSec * 1.2;
    }
  }, [liveBytesPerSec]);

  useEffect(() => {
    if (phase === "idle" || phase === "ping") gaugeMaxRef.current = GAUGE_FLOOR_BYTES_PER_SEC;
  }, [phase]);

  const displayValue = unit === "MBps" ? bytesPerSecToMBps(liveBytesPerSec) : bytesPerSecToMbps(liveBytesPerSec);
  const isRunning = phase === "ping" || phase === "download" || phase === "upload";
  const isDone = phase === "done";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 px-4 pb-24">
      <div className="flex flex-col items-center gap-6">
        <AnimatePresence mode="wait">
          {phase === "idle" || phase === "error" ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                How fast is your <span className="text-gradient">connection</span>?
              </h1>
              <p className="max-w-md text-sm text-current/50">
                One tap. Download, upload, ping and streaming readiness — measured live, explained simply.
              </p>
              {error && <p className="text-xs text-rose-400">{error} — try again.</p>}
            </motion.div>
          ) : (
            <motion.div
              key="running"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <PhaseIndicator phase={phase} />
            </motion.div>
          )}
        </AnimatePresence>

        <GoButton phase={phase} onStart={phase === "done" || phase === "error" ? start : isRunning ? cancel : start} />

        {(isRunning || isDone) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <SpeedGauge
              bytesPerSec={liveBytesPerSec}
              displayValue={isDone && result ? (unit === "MBps" ? bytesPerSecToMBps(result.downloadBytesPerSec) : bytesPerSecToMbps(result.downloadBytesPerSec)) : displayValue}
              maxBytesPerSec={gaugeMaxRef.current}
              unit={unit}
              phaseLabel={phaseCopy[phase]}
            />
          </motion.div>
        )}

        {isRunning && (
          <div className="w-full max-w-sm">
            <LiveGraph points={graphPoints} maxValue={gaugeMaxRef.current} />
          </div>
        )}

        {ping && phase !== "idle" && (
          <div className="flex gap-4 text-xs text-current/40">
            <span>Ping {ping.avgMs.toFixed(0)} ms</span>
            <span>Jitter {ping.jitterMs.toFixed(0)} ms</span>
          </div>
        )}

        {(isRunning || isDone) && <UnitToggle unit={unit} onChange={setUnit} />}
      </div>

      <AnimatePresence>
        {isDone && result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full flex-col gap-4"
          >
            <ResultsSummary result={result} unit={unit} />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <NetworkStrengthMeter strength={result.strength} />
              <StreamingRating rating={result.streaming} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <ISPPanel ipInfo={ipInfo} />
              <DeviceInfoCard />
              <HistorySparkline history={history} />
            </div>

            <ResultCard result={result} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

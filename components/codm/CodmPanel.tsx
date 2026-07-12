"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Globe2, Router, ShieldCheck } from "lucide-react";
import { useCodmPingTest } from "@/hooks/useCodmPingTest";
import { buildRecommendations } from "@/lib/codm/recommendations";
import { CodmScanButton } from "./CodmScanButton";
import { CodmPingGauge } from "./CodmPingGauge";
import { CodmRegionResults } from "./CodmRegionResults";
import { CodmRecommendations } from "./CodmRecommendations";
import { CodmIspHistoryTable } from "./CodmIspHistoryTable";
import { TooltipWrap } from "@/components/ui/Tooltip";

export function CodmPanel() {
  const { phase, regions, ipInfo, result, error, start } = useCodmPingTest();
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const scanning = phase === "scanning";
  const done = phase === "done" && result != null;

  const recommendations = useMemo(() => {
    if (!result) return [];
    return buildRecommendations({ best: result.best, regions: result.regions, ispName: result.ispName });
  }, [result]);

  const handleStart = () => {
    start();
    // history table re-reads localStorage once the scan settles
    setTimeout(() => setHistoryRefreshKey((k) => k + 1), 50);
  };

  const location = ipInfo ? [ipInfo.city, ipInfo.region, ipInfo.country].filter(Boolean).join(", ") : null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 px-4 pb-16">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-white/10"
          style={{ boxShadow: "0 0 30px rgba(56,189,248,0.25), 0 0 30px rgba(244,63,94,0.15)" }}
        >
          <Image src="/og-clan-logo.jpg" alt="OG Clan Cameroon" fill className="object-cover" priority />
        </motion.div>

        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            <span className="bg-gradient-to-r from-sky-400 via-white to-rose-500 bg-clip-text text-transparent">
              CODM Ping Accuracy Engine
            </span>
          </h1>
          <p className="max-w-md text-sm text-white/50">
            Measures your connection under worst-case conditions across CODM&apos;s nearest server hubs — so real
            matches feel the same or better than what&apos;s reported.
          </p>
        </div>

        {(ipInfo || scanning) && (
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-white/40">
            <TooltipWrap text="Your ISP and location come from your public IP. Each region below is probed live from your device — not a cached lookup.">
              <span className="flex items-center gap-1.5">
                <Router size={12} />
                {ipInfo?.isp ?? "Detecting ISP…"}
              </span>
            </TooltipWrap>
            {location && (
              <span className="flex items-center gap-1.5">
                <Globe2 size={12} />
                {location}
              </span>
            )}
          </div>
        )}
      </div>

      <CodmScanButton phase={phase} onStart={handleStart} />

      {error && <p className="text-xs text-rose-400">{error} — try again.</p>}

      {(scanning || regions.length > 0) && (
        <div className="flex w-full flex-col gap-3">
          <span className="text-center text-[11px] font-semibold uppercase tracking-widest text-white/30">
            Server Hub Scan
          </span>
          <CodmRegionResults regions={regions} scanning={scanning} bestRegionId={result?.best?.regionId} />
        </div>
      )}

      <AnimatePresence>
        {done && result.best && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full flex-col items-center gap-6"
          >
            <CodmPingGauge pingMs={result.best.codmPingMs ?? 200} tier={result.tier} />
            <div className="flex w-full flex-col gap-3">
              <CodmRecommendations recommendations={recommendations} />
              <CodmIspHistoryTable refreshKey={historyRefreshKey} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-amber-400/70">
        <ShieldCheck size={12} />
        Powered by OG Clan engines for Cameroonian Gamers
      </div>
    </div>
  );
}

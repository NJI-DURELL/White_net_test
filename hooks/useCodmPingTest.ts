import { useCallback, useRef, useState } from "react";
import { CODM_REGIONS } from "@/lib/codm/regions";
import { applyCalibration, getCodmTier, pickBestRegion, probeAllRegions } from "@/lib/codm/scoring";
import { appendIspHistory } from "@/lib/codm/ispHistory";
import { getCalibration, saveCalibration } from "@/lib/codm/calibration";
import type { CodmScanResult, RegionProbeResult } from "@/lib/codm/types";
import type { IpInfo } from "@/lib/types";

export type CodmScanPhase = "idle" | "scanning" | "done" | "error";

export function useCodmPingTest() {
  const [phase, setPhase] = useState<CodmScanPhase>("idle");
  const [regions, setRegions] = useState<RegionProbeResult[]>([]);
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
  const [result, setResult] = useState<CodmScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runIdRef = useRef(0);
  // Uncalibrated probe output kept separately so calibrate() always scales
  // from the true raw measurement, not an already-scaled display value.
  const rawRegionsRef = useRef<RegionProbeResult[]>([]);
  const ispNameRef = useRef<string | null>(null);

  const buildResult = useCallback((rawRegions: RegionProbeResult[], ispName: string | null): CodmScanResult => {
    const calibration = getCalibration(ispName);
    const ratio = calibration?.ratio ?? 1;
    const displayRegions = applyCalibration(rawRegions, ratio);
    const best = pickBestRegion(displayRegions);
    const tier = getCodmTier(best?.codmPingMs ?? 999);

    return {
      timestamp: Date.now(),
      ispName,
      regions: displayRegions,
      best,
      tier,
      calibrated: calibration != null,
    };
  }, []);

  const start = useCallback(async () => {
    const runId = ++runIdRef.current;
    setError(null);
    setResult(null);
    setRegions([]);
    setPhase("scanning");

    let ispSnapshot: IpInfo | null = null;
    try {
      const res = await fetch("/api/ip-info");
      ispSnapshot = await res.json();
      if (runIdRef.current === runId) setIpInfo(ispSnapshot);
    } catch {
      if (runIdRef.current === runId) setIpInfo(null);
    }
    ispNameRef.current = ispSnapshot?.isp ?? null;

    try {
      const settled = await probeAllRegions(CODM_REGIONS, (single) => {
        if (runIdRef.current !== runId) return;
        setRegions((prev) => {
          const next = prev.filter((r) => r.regionId !== single.regionId);
          next.push(single);
          return next;
        });
      });
      if (runIdRef.current !== runId) return;

      rawRegionsRef.current = settled;
      const scanResult = buildResult(settled, ispNameRef.current);

      setResult(scanResult);
      setPhase("done");

      if (scanResult.best?.codmPingMs != null) {
        appendIspHistory({
          timestamp: scanResult.timestamp,
          ispName: ispNameRef.current ?? "Unknown ISP",
          bestCodmPingMs: scanResult.best.codmPingMs,
          bestRegionLabel: scanResult.best.label,
          tierLabel: scanResult.tier.label,
        });
      }
    } catch (err) {
      if (runIdRef.current !== runId) return;
      setError(err instanceof Error ? err.message : "CODM scan failed");
      setPhase("error");
    }
  }, [buildResult]);

  /**
   * Calibrates using the player's real in-game CODM ping (read straight off
   * CODM's own HUD). We can't reach the actual game server from a browser,
   * so this is the only way to close the gap between our generic-cloud
   * proxy reading and reality for their specific ISP/route.
   */
  const calibrate = useCallback(
    (actualMs: number) => {
      const rawBest = pickBestRegion(rawRegionsRef.current);
      const ispName = ispNameRef.current;
      if (!rawBest?.codmPingMs || !ispName) return;

      saveCalibration(ispName, rawBest.codmPingMs, actualMs);
      const recalibrated = buildResult(rawRegionsRef.current, ispName);
      setResult(recalibrated);

      if (recalibrated.best?.codmPingMs != null) {
        appendIspHistory({
          timestamp: recalibrated.timestamp,
          ispName,
          bestCodmPingMs: recalibrated.best.codmPingMs,
          bestRegionLabel: recalibrated.best.label,
          tierLabel: recalibrated.tier.label,
        });
      }
    },
    [buildResult]
  );

  const reset = useCallback(() => {
    runIdRef.current++;
    setPhase("idle");
    setRegions([]);
    setResult(null);
    setError(null);
  }, []);

  return { phase, regions, ipInfo, result, error, start, reset, calibrate };
}

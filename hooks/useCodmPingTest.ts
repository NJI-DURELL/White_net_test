import { useCallback, useRef, useState } from "react";
import { CODM_REGIONS } from "@/lib/codm/regions";
import { getCodmTier, pickBestRegion, probeAllRegions } from "@/lib/codm/scoring";
import { appendIspHistory } from "@/lib/codm/ispHistory";
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

      const best = pickBestRegion(settled);
      const tier = getCodmTier(best?.codmPingMs ?? 999);

      const scanResult: CodmScanResult = {
        timestamp: Date.now(),
        ispName: ispSnapshot?.isp ?? null,
        regions: settled,
        best,
        tier,
      };

      setResult(scanResult);
      setPhase("done");

      if (best?.codmPingMs != null) {
        appendIspHistory({
          timestamp: scanResult.timestamp,
          ispName: ispSnapshot?.isp ?? "Unknown ISP",
          bestCodmPingMs: best.codmPingMs,
          bestRegionLabel: best.label,
          tierLabel: tier.label,
        });
      }
    } catch (err) {
      if (runIdRef.current !== runId) return;
      setError(err instanceof Error ? err.message : "CODM scan failed");
      setPhase("error");
    }
  }, []);

  const reset = useCallback(() => {
    runIdRef.current++;
    setPhase("idle");
    setRegions([]);
    setResult(null);
    setError(null);
  }, []);

  return { phase, regions, ipInfo, result, error, start, reset };
}

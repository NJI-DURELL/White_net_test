export type RegionProbeStatus = "ok" | "unreachable";

export interface RegionProbeResult {
  regionId: string;
  label: string;
  shortLabel: string;
  note: string;
  status: RegionProbeStatus;
  /** Worst-case-biased measured RTT to the proxy hub (ms), null if unreachable. */
  rawMs: number | null;
  /** Calibrated estimate of in-game CODM ping on the 0-200+ scale, null if unreachable. */
  codmPingMs: number | null;
  jitterMs: number;
  lossPct: number;
  samples: number[];
}

export interface CodmTier {
  label: string;
  color: string;
  advice: string;
}

export interface CodmScanResult {
  timestamp: number;
  ispName: string | null;
  regions: RegionProbeResult[];
  best: RegionProbeResult | null;
  tier: CodmTier;
}

import { percentile, stddev } from "@/lib/stats";
import { CODM_REGIONS, type CodmRegion } from "./regions";
import type { CodmTier, RegionProbeResult } from "./types";

// Sequential probes per region: index 0 pays for TCP/TLS warm-up and is
// discarded, matching the same warm-up handling used by the main ping test.
export const CODM_PROBE_SAMPLES = 6;
// Cross-region HTTPS round-trips can legitimately run slower than the local
// /api/ping probe (further hop, foreign TLS terminator) — generous timeout
// so a genuinely slow-but-alive path isn't misread as "unreachable".
export const CODM_PROBE_TIMEOUT_MS = 4000;
// Bail out of a region early after this many consecutive failures instead
// of burning the full timeout on every remaining sample.
export const CODM_MAX_CONSECUTIVE_FAILURES = 2;
// Worst-case bias: report the 75th percentile of samples rather than the
// mean, so real matches feel the same or better than what's shown here —
// never a nasty surprise mid-game.
export const CODM_WORST_CASE_PERCENTILE = 0.75;
// Real CODM traffic is lightweight UDP with no TLS handshake/HTTP framing;
// an HTTPS RTT to the same regional hub therefore over-states raw transport
// latency by roughly this much. Applied AFTER the worst-case percentile
// pick, so it calibrates toward realistic in-game numbers without
// undermining the pessimistic sampling above.
export const CODM_PROTOCOL_FACTOR = 0.82;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

async function probeOnce(url: string, timeoutMs: number): Promise<number | null> {
  const start = performance.now();
  try {
    // HEAD, not GET: an S3 bucket root answers GET with a 307 redirect to
    // AWS's marketing site, and fetch (even in no-cors mode) follows
    // redirects transparently — that was silently adding a second
    // cross-origin round trip (and a full page load) on top of every single
    // sample, inflating every region's reading by 1-1.5s+. S3 answers HEAD
    // with a direct 405 at the regional edge itself, no redirect, which is
    // what actually measures RTT to that hub.
    // no-cors keeps this a "simple" cross-origin request (no preflight) and
    // avoids CORS rejection — the response is opaque, but the promise still
    // resolves once the round trip completes, which is all timing needs.
    await fetch(url, {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
    return performance.now() - start;
  } catch {
    return null;
  }
}

export async function probeRegion(region: CodmRegion): Promise<RegionProbeResult> {
  const rtts: number[] = [];
  let attempted = 0;
  let failures = 0;
  let consecutiveFailures = 0;

  for (let i = 0; i < CODM_PROBE_SAMPLES; i++) {
    const rtt = await probeOnce(region.probeUrl, CODM_PROBE_TIMEOUT_MS);
    if (i === 0) continue; // warm-up sample, not counted either way

    attempted += 1;
    if (rtt === null) {
      failures += 1;
      consecutiveFailures += 1;
      if (consecutiveFailures >= CODM_MAX_CONSECUTIVE_FAILURES) break;
    } else {
      consecutiveFailures = 0;
      rtts.push(rtt);
    }
  }

  if (rtts.length === 0) {
    return {
      regionId: region.id,
      label: region.label,
      shortLabel: region.shortLabel,
      note: region.note,
      status: "unreachable",
      rawMs: null,
      codmPingMs: null,
      jitterMs: 0,
      lossPct: attempted ? 100 : 0,
      samples: [],
    };
  }

  const rawMs = percentile(rtts, CODM_WORST_CASE_PERCENTILE);
  const codmPingMs = clamp(Math.round(rawMs * CODM_PROTOCOL_FACTOR), 1, 999);

  return {
    regionId: region.id,
    label: region.label,
    shortLabel: region.shortLabel,
    note: region.note,
    status: "ok",
    rawMs,
    codmPingMs,
    jitterMs: rtts.length > 1 ? stddev(rtts) : 0,
    lossPct: attempted ? (failures / attempted) * 100 : 0,
    samples: rtts,
  };
}

export async function probeAllRegions(
  regions: CodmRegion[] = CODM_REGIONS,
  onRegionDone?: (result: RegionProbeResult) => void
): Promise<RegionProbeResult[]> {
  // Regions run in parallel — these are single-digit-KB HEAD-weight probes,
  // not throughput tests, so concurrent requests don't meaningfully
  // contend with each other or skew each other's timing.
  const results = await Promise.all(
    regions.map(async (region) => {
      const result = await probeRegion(region);
      onRegionDone?.(result);
      return result;
    })
  );
  return results;
}

export function pickBestRegion(regions: RegionProbeResult[]): RegionProbeResult | null {
  const reachable = regions.filter((r) => r.status === "ok" && r.codmPingMs !== null);
  if (reachable.length === 0) return null;
  return reachable.reduce((best, r) => (r.codmPingMs! < best.codmPingMs! ? r : best));
}

/**
 * Scales every region's estimate by a per-ISP calibration ratio derived from
 * a real CODM in-game ping the player supplied. Assumes the gap between our
 * generic-cloud-region proxy and the real game server is roughly
 * proportional across regions on the same ISP — not exact, but far closer
 * than the uncalibrated raw estimate, which has no way to account for
 * CODM's servers sitting on completely different (better-peered) transit
 * than a generic cloud storage region.
 */
export function applyCalibration(regions: RegionProbeResult[], ratio: number): RegionProbeResult[] {
  if (ratio === 1) return regions;
  return regions.map((r) =>
    r.codmPingMs == null ? r : { ...r, codmPingMs: clamp(Math.round(r.codmPingMs * ratio), 1, 999) }
  );
}

export const CODM_TIERS: (CodmTier & { min: number })[] = [
  { min: 0, label: "Excellent", color: "#34d399", advice: "Tournament-ready. Push ranked, play aggressively." },
  { min: 50, label: "Good", color: "#a3e635", advice: "Solid for ranked and MP. Minor timing windows may still slip." },
  { min: 100, label: "Fair", color: "#fbbf24", advice: "Playable, but expect occasional hit-reg delay — favor mid-range weapons over close-quarters duels." },
  { min: 150, label: "Poor", color: "#fb923c", advice: "Noticeable lag likely. Stick to objective-based modes, avoid gunfights you can't afford to lose." },
  { min: 200, label: "Unplayable", color: "#f87171", advice: "Ranked/BR not recommended at this ping — fix the connection before queuing." },
];

export function getCodmTier(pingMs: number): CodmTier {
  const tier = [...CODM_TIERS].reverse().find((t) => pingMs >= t.min) ?? CODM_TIERS[0];
  return { label: tier.label, color: tier.color, advice: tier.advice };
}

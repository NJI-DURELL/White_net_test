import { useCallback } from "react";
import { PING_SAMPLE_COUNT, PING_TIMEOUT_MS } from "@/lib/constants";
import { median, stddev } from "@/lib/stats";
import type { PingResult } from "@/lib/types";

async function singlePing(timeoutMs: number): Promise<number | null> {
  const start = performance.now();
  try {
    const res = await fetch("/api/ping", {
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    return performance.now() - start;
  } catch {
    return null;
  }
}

export function usePingTest() {
  const run = useCallback(async (onSample?: (ms: number, index: number) => void): Promise<PingResult> => {
    // Single sequential pass: sample 0 pays for TCP/TLS warm-up and is
    // discarded, everything after feeds both the latency stats AND the loss
    // estimate. Sequential (not parallel) so each probe reflects real
    // uncontended round-trip time rather than requests queuing behind each
    // other on a slow link.
    const attempts: (number | null)[] = [];

    for (let i = 0; i < PING_SAMPLE_COUNT; i++) {
      const rtt = await singlePing(PING_TIMEOUT_MS);
      attempts.push(rtt);
      if (i > 0 && rtt !== null) onSample?.(rtt, i);
    }

    const measured = attempts.slice(1); // drop warm-up sample
    const successes = measured.filter((v): v is number => v !== null);
    const packetLossPct = measured.length ? ((measured.length - successes.length) / measured.length) * 100 : 0;

    return {
      // Median resists a single slow/spiky round-trip skewing the headline
      // number — closer to what play actually feels like than a raw mean.
      avgMs: successes.length ? median(successes) : 0,
      // Jitter should reflect true variability, so it's computed on the raw
      // (untrimmed) successful samples, spikes included.
      jitterMs: successes.length > 1 ? stddev(successes) : 0,
      packetLossPct,
      samples: successes,
    };
  }, []);

  return { run };
}

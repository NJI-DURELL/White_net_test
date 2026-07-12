import { useCallback } from "react";
import { PING_LOSS_SAMPLE_COUNT, PING_SAMPLE_COUNT, PING_TIMEOUT_MS } from "@/lib/constants";
import { mean, stddev } from "@/lib/stats";
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
    const rtts: number[] = [];

    for (let i = 0; i < PING_SAMPLE_COUNT; i++) {
      const rtt = await singlePing(PING_TIMEOUT_MS);
      if (rtt !== null) {
        if (i > 0) rtts.push(rtt); // discard first sample (connection warm-up)
        onSample?.(rtt, i);
      }
    }

    // Larger, shorter-timeout batch purely to estimate loss rate.
    let failures = 0;
    for (let i = 0; i < PING_LOSS_SAMPLE_COUNT; i++) {
      const rtt = await singlePing(PING_TIMEOUT_MS);
      if (rtt === null) failures += 1;
    }

    return {
      avgMs: rtts.length ? mean(rtts) : 0,
      jitterMs: rtts.length ? stddev(rtts) : 0,
      packetLossPct: (failures / PING_LOSS_SAMPLE_COUNT) * 100,
      samples: rtts,
    };
  }, []);

  return { run };
}

import { useCallback, useRef } from "react";
import {
  DOWNLOAD_ABORT_GRACE_MS,
  DOWNLOAD_DEFAULT_DURATION_MS,
  ROLLING_WINDOW_MS,
  SLOW_LINK_EXTENDED_DURATION_MS,
  SLOW_LINK_THRESHOLD_BYTES_PER_SEC,
  WARMUP_DISCARD_MAX_SHARE,
  WARMUP_DISCARD_MS,
} from "@/lib/constants";
import type { ThroughputResult, ThroughputSample } from "@/lib/types";

export type ProgressHandler = (instantBytesPerSec: number, elapsedMs: number, totalBytes: number) => void;

export function useDownloadTest() {
  const abortRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const run = useCallback(
    async (targetDurationMs: number = DOWNLOAD_DEFAULT_DURATION_MS, onProgress?: ProgressHandler): Promise<ThroughputResult> => {
      const controller = new AbortController();
      abortRef.current = controller;

      const start = performance.now();
      const samples: ThroughputSample[] = [];
      let totalBytes = 0;
      let peak = 0;
      let lastElapsed = 0;

      // Effective cutoff — starts at the requested duration, but can grow up
      // to the slow-link ceiling if early throughput looks too low to trust
      // a short sample. The server is always asked to keep the stream open
      // that long, so extending doesn't require a second request.
      let effectiveDurationMs = targetDurationMs;
      let adaptDecided = false;

      const serverDurationMs = Math.max(targetDurationMs, SLOW_LINK_EXTENDED_DURATION_MS);
      const timeoutId = setTimeout(() => controller.abort(), serverDurationMs + DOWNLOAD_ABORT_GRACE_MS);

      try {
        const res = await fetch(`/api/download?duration=${serverDurationMs}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.body) throw new Error("Download stream unavailable");

        const reader = res.body.getReader();
        let lastReportTime = 0;

        while (true) {
          const { done, value } = await reader.read();
          const now = performance.now() - start;
          if (done) break;
          if (value) totalBytes += value.length;
          samples.push({ t: now, bytes: totalBytes });
          lastElapsed = now;

          if (now - lastReportTime >= 50) {
            const windowStart = now - ROLLING_WINDOW_MS;
            const windowSamples = samples.filter((s) => s.t >= windowStart);
            if (windowSamples.length >= 2) {
              const first = windowSamples[0];
              const last = windowSamples[windowSamples.length - 1];
              const dt = (last.t - first.t) / 1000;
              const instant = dt > 0 ? (last.bytes - first.bytes) / dt : 0;
              peak = Math.max(peak, instant);
              onProgress?.(instant, now, totalBytes);

              // Decide once, shortly after warm-up ends, whether this link
              // needs the extended window for a statistically sound average.
              if (!adaptDecided && now >= WARMUP_DISCARD_MS + 1000) {
                adaptDecided = true;
                if (instant < SLOW_LINK_THRESHOLD_BYTES_PER_SEC) {
                  effectiveDurationMs = serverDurationMs;
                }
              }
            }
            lastReportTime = now;
          }

          if (now >= effectiveDurationMs) {
            controller.abort();
            break;
          }
        }
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          throw err;
        }
      } finally {
        clearTimeout(timeoutId);
      }

      const warmupMs = Math.min(WARMUP_DISCARD_MS, effectiveDurationMs * WARMUP_DISCARD_MAX_SHARE);
      const usableSamples = samples.filter((s) => s.t >= warmupMs);
      const bytesPerSec = computeAverage(usableSamples, samples, lastElapsed);

      return { bytesPerSec, peakBytesPerSec: peak, samples };
    },
    []
  );

  return { run, cancel };
}

function computeAverage(usable: ThroughputSample[], all: ThroughputSample[], elapsedMs: number): number {
  if (usable.length >= 2) {
    const first = usable[0];
    const last = usable[usable.length - 1];
    const dtSec = (last.t - first.t) / 1000;
    if (dtSec > 0) return (last.bytes - first.bytes) / dtSec;
  }
  // Fallback for very slow links where fewer than 2 samples landed after the
  // warm-up cutoff — use total bytes over total elapsed time (from an
  // implicit t=0/bytes=0 origin) instead of reporting a flat 0, which was
  // the "wrong reading" bug on very slow connections.
  const last = all[all.length - 1];
  if (!last || elapsedMs <= 0) return 0;
  return last.bytes / (elapsedMs / 1000);
}

import { useCallback, useRef } from "react";
import {
  DOWNLOAD_DEFAULT_DURATION_MS,
  ROLLING_WINDOW_MS,
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
    async (durationMs: number = DOWNLOAD_DEFAULT_DURATION_MS, onProgress?: ProgressHandler): Promise<ThroughputResult> => {
      const controller = new AbortController();
      abortRef.current = controller;

      const start = performance.now();
      const samples: ThroughputSample[] = [];
      let totalBytes = 0;
      let peak = 0;

      const timeoutId = setTimeout(() => controller.abort(), durationMs + 500);

      try {
        const res = await fetch(`/api/download?duration=${durationMs}`, {
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
            }
            lastReportTime = now;
          }

          if (now >= durationMs) {
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

      const usableSamples = samples.filter((s) => s.t >= WARMUP_DISCARD_MS);
      const bytesPerSec = computeAverage(usableSamples, samples);

      return { bytesPerSec, peakBytesPerSec: peak, samples };
    },
    []
  );

  return { run, cancel };
}

function computeAverage(usable: ThroughputSample[], all: ThroughputSample[]): number {
  const pool = usable.length >= 2 ? usable : all;
  if (pool.length < 2) return 0;
  const first = pool[0];
  const last = pool[pool.length - 1];
  const dtSec = (last.t - first.t) / 1000;
  if (dtSec <= 0) return 0;
  return (last.bytes - first.bytes) / dtSec;
}

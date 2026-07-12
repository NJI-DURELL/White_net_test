import { useCallback, useRef } from "react";
import {
  ROLLING_WINDOW_MS,
  SLOW_LINK_EXTENDED_DURATION_MS,
  SLOW_LINK_THRESHOLD_BYTES_PER_SEC,
  UPLOAD_ABORT_GRACE_MS,
  UPLOAD_BUFFER_BYTES,
  UPLOAD_TARGET_DURATION_MS,
  WARMUP_DISCARD_MAX_SHARE,
  WARMUP_DISCARD_MS,
} from "@/lib/constants";
import { randomChunk } from "@/lib/randomBytes";
import type { ThroughputResult, ThroughputSample } from "@/lib/types";
import type { ProgressHandler } from "./useDownloadTest";

let cachedBuffer: Uint8Array | null = null;

function getUploadBuffer(): Uint8Array {
  if (!cachedBuffer) {
    cachedBuffer = randomChunk(UPLOAD_BUFFER_BYTES);
  }
  return cachedBuffer;
}

export function useUploadTest() {
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const cancel = useCallback(() => {
    xhrRef.current?.abort();
  }, []);

  const run = useCallback(
    (targetDurationMs: number = UPLOAD_TARGET_DURATION_MS, onProgress?: ProgressHandler): Promise<ThroughputResult> => {
      return new Promise((resolve, reject) => {
        const buffer = getUploadBuffer();
        const blob = new Blob([buffer as BlobPart]);

        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        const start = performance.now();
        const samples: ThroughputSample[] = [];
        let peak = 0;
        let lastElapsed = 0;
        let effectiveDurationMs = targetDurationMs;
        let adaptDecided = false;
        let capTimer: ReturnType<typeof setTimeout> | null = null;

        // `durationFromStartMs` is measured from xhr start, not from "now" —
        // rescheduling mid-upload must account for time already elapsed so
        // the cap still lands at (start + duration + grace), not later.
        const scheduleCap = (durationFromStartMs: number) => {
          if (capTimer) clearTimeout(capTimer);
          const elapsedSinceStart = performance.now() - start;
          const delay = Math.max(0, durationFromStartMs + UPLOAD_ABORT_GRACE_MS - elapsedSinceStart);
          capTimer = setTimeout(() => {
            if (xhr.readyState !== XMLHttpRequest.DONE) xhr.abort();
          }, delay);
        };

        xhr.upload.onprogress = (e) => {
          if (!e.lengthComputable) return;
          const now = performance.now() - start;
          samples.push({ t: now, bytes: e.loaded });
          lastElapsed = now;

          const windowStart = now - ROLLING_WINDOW_MS;
          const windowSamples = samples.filter((s) => s.t >= windowStart);
          if (windowSamples.length >= 2) {
            const first = windowSamples[0];
            const last = windowSamples[windowSamples.length - 1];
            const dt = (last.t - first.t) / 1000;
            const instant = dt > 0 ? (last.bytes - first.bytes) / dt : 0;
            peak = Math.max(peak, instant);
            onProgress?.(instant, now, e.loaded);

            // Same adaptive-extension logic as the download test: give slow
            // links more time to produce a statistically sound reading
            // instead of cutting off after a few noisy seconds.
            if (!adaptDecided && now >= WARMUP_DISCARD_MS + 1000) {
              adaptDecided = true;
              if (instant < SLOW_LINK_THRESHOLD_BYTES_PER_SEC) {
                effectiveDurationMs = SLOW_LINK_EXTENDED_DURATION_MS;
                scheduleCap(effectiveDurationMs);
              }
            }
          }
        };

        const finish = () => {
          if (capTimer) clearTimeout(capTimer);
          const warmupMs = Math.min(WARMUP_DISCARD_MS, effectiveDurationMs * WARMUP_DISCARD_MAX_SHARE);
          const usable = samples.filter((s) => s.t >= warmupMs);
          const bytesPerSec = computeAverage(usable, lastElapsed);
          resolve({ bytesPerSec, peakBytesPerSec: peak, samples });
        };

        xhr.onload = finish;
        xhr.onabort = finish;
        xhr.onerror = () => reject(new Error("Upload failed"));

        xhr.open("POST", "/api/upload");
        xhr.setRequestHeader("Content-Type", "application/octet-stream");
        xhr.send(blob);

        scheduleCap(effectiveDurationMs);
      });
    },
    []
  );

  return { run, cancel };
}

function computeAverage(usable: ThroughputSample[], elapsedMs: number): number {
  if (usable.length >= 2) {
    const first = usable[0];
    const last = usable[usable.length - 1];
    const dtSec = (last.t - first.t) / 1000;
    if (dtSec > 0) return (last.bytes - first.bytes) / dtSec;
  }
  // Fallback for very slow uploads where fewer than 2 progress events landed
  // after the warm-up cutoff — total bytes sent over total elapsed time
  // beats reporting a flat 0.
  if (usable.length === 1 && elapsedMs > 0) return usable[0].bytes / (elapsedMs / 1000);
  return 0;
}

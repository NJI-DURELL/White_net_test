import { useCallback, useRef } from "react";
import {
  ROLLING_WINDOW_MS,
  UPLOAD_BUFFER_BYTES,
  UPLOAD_TARGET_DURATION_MS,
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
    (durationMs: number = UPLOAD_TARGET_DURATION_MS, onProgress?: ProgressHandler): Promise<ThroughputResult> => {
      return new Promise((resolve, reject) => {
        const buffer = getUploadBuffer();
        const blob = new Blob([buffer as BlobPart]);

        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        const start = performance.now();
        const samples: ThroughputSample[] = [];
        let peak = 0;
        let capTimer: ReturnType<typeof setTimeout> | null = null;

        xhr.upload.onprogress = (e) => {
          if (!e.lengthComputable) return;
          const now = performance.now() - start;
          samples.push({ t: now, bytes: e.loaded });

          const windowStart = now - ROLLING_WINDOW_MS;
          const windowSamples = samples.filter((s) => s.t >= windowStart);
          if (windowSamples.length >= 2) {
            const first = windowSamples[0];
            const last = windowSamples[windowSamples.length - 1];
            const dt = (last.t - first.t) / 1000;
            const instant = dt > 0 ? (last.bytes - first.bytes) / dt : 0;
            peak = Math.max(peak, instant);
            onProgress?.(instant, now, e.loaded);
          }
        };

        const finish = () => {
          if (capTimer) clearTimeout(capTimer);
          const usable = samples.filter((s) => s.t >= WARMUP_DISCARD_MS);
          const pool = usable.length >= 2 ? usable : samples;
          let bytesPerSec = 0;
          if (pool.length >= 2) {
            const first = pool[0];
            const last = pool[pool.length - 1];
            const dtSec = (last.t - first.t) / 1000;
            bytesPerSec = dtSec > 0 ? (last.bytes - first.bytes) / dtSec : 0;
          }
          resolve({ bytesPerSec, peakBytesPerSec: peak, samples });
        };

        xhr.onload = finish;
        xhr.onabort = finish;
        xhr.onerror = () => reject(new Error("Upload failed"));

        xhr.open("POST", "/api/upload");
        xhr.setRequestHeader("Content-Type", "application/octet-stream");
        xhr.send(blob);

        capTimer = setTimeout(() => {
          if (xhr.readyState !== XMLHttpRequest.DONE) xhr.abort();
        }, durationMs);
      });
    },
    []
  );

  return { run, cancel };
}

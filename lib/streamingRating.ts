import { STREAMING_THRESHOLDS } from "./constants";
import { bytesPerSecToMBps } from "./units";
import type { StreamingRating } from "./types";

export function computeStreamingRating(
  downloadBytesPerSec: number,
  jitterMs: number,
  packetLossPct: number
): StreamingRating {
  const mbps = bytesPerSecToMBps(downloadBytesPerSec);
  let index = STREAMING_THRESHOLDS.findIndex((t) => mbps >= t.minMBps);
  if (index === -1) index = STREAMING_THRESHOLDS.length - 1;

  // Unstable connections buffer/stutter even when raw throughput looks fine —
  // downgrade one tier if jitter or estimated packet loss is high.
  const unstable = jitterMs > 40 || packetLossPct > 3;
  if (unstable && index < STREAMING_THRESHOLDS.length - 1) {
    index += 1;
  }

  const tier = STREAMING_THRESHOLDS[index];
  return { label: tier.label, detail: tier.detail };
}

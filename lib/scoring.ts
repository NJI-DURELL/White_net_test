import { STRENGTH_LABELS, STRENGTH_WEIGHTS } from "./constants";
import { bytesPerSecToMBps } from "./units";
import { normalizeInverse, normalizeLinear } from "./stats";
import type { StrengthResult } from "./types";

export interface StrengthInputs {
  downloadBytesPerSec: number;
  uploadBytesPerSec: number;
  pingMs: number;
  jitterMs: number;
  packetLossPct: number;
}

/**
 * Composite 0-100 "Network Strength" score.
 * NOTE: browsers cannot read real WiFi/cellular radio signal strength (dBm) —
 * this is a synthesized connection-quality score from measured throughput,
 * latency, jitter and estimated packet loss, not a hardware signal readout.
 */
export function computeStrength(inputs: StrengthInputs): StrengthResult {
  const downloadScore = normalizeLinear(bytesPerSecToMBps(inputs.downloadBytesPerSec), 0, 30);
  const uploadScore = normalizeLinear(bytesPerSecToMBps(inputs.uploadBytesPerSec), 0, 10);
  const latencyScore = normalizeInverse(inputs.pingMs, 200, 20);

  const jitterScore = normalizeInverse(inputs.jitterMs, 30, 2);
  const lossScore = normalizeInverse(inputs.packetLossPct, 5, 0);
  const stabilityScore = (jitterScore + lossScore) / 2;

  const composite =
    downloadScore * STRENGTH_WEIGHTS.download +
    uploadScore * STRENGTH_WEIGHTS.upload +
    latencyScore * STRENGTH_WEIGHTS.latency +
    stabilityScore * STRENGTH_WEIGHTS.stability;

  const score = Math.round(composite);
  const tier = STRENGTH_LABELS.find((t) => score >= t.min) ?? STRENGTH_LABELS[STRENGTH_LABELS.length - 1];

  return { score, label: tier.label, color: tier.color };
}

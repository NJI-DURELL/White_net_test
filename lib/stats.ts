export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = mean(values.map((v) => (v - m) ** 2));
  return Math.sqrt(variance);
}

/** Robust central tendency — resistant to a single slow/spiky sample skewing the read. */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * Percentile with linear interpolation, `p` in [0, 1].
 * Used for worst-case-biased readings (e.g. p=0.75 favors the slower end of
 * the sample set so real-world play feels the same or better than reported).
 */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = (sorted.length - 1) * Math.min(1, Math.max(0, p));
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

/** Piecewise-linear normalize: 0 at `zeroAt`, 100 at `hundredAt` (clamped). */
export function normalizeLinear(value: number, zeroAt: number, hundredAt: number): number {
  if (hundredAt === zeroAt) return 0;
  const t = (value - zeroAt) / (hundredAt - zeroAt);
  return Math.min(100, Math.max(0, t * 100));
}

/** Inverse normalize for "lower is better" metrics like latency/jitter. */
export function normalizeInverse(value: number, hundredAt: number, zeroAt: number): number {
  return normalizeLinear(value, zeroAt, hundredAt);
}

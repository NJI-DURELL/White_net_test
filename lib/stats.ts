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

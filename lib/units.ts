export type SpeedUnit = "MBps" | "Mbps";

/** Decimal SI conversion throughout — 1 MB/s = 1,000,000 bytes/sec. */
export function bytesPerSecToMBps(bytesPerSec: number): number {
  return bytesPerSec / 1_000_000;
}

export function bytesPerSecToMbps(bytesPerSec: number): number {
  return (bytesPerSec * 8) / 1_000_000;
}

export function formatSpeed(bytesPerSec: number, unit: SpeedUnit): string {
  const value = unit === "MBps" ? bytesPerSecToMBps(bytesPerSec) : bytesPerSecToMbps(bytesPerSec);
  return value >= 100 ? value.toFixed(0) : value.toFixed(1);
}

export function unitLabel(unit: SpeedUnit): string {
  return unit === "MBps" ? "MB/s" : "Mbps";
}

const CODM_CALIBRATION_KEY = "wnt.codm.calibration.v1";

export interface CodmCalibration {
  ispName: string;
  /** actualMs / rawScanMs at calibration time — applied to every future raw reading. */
  ratio: number;
  rawSampleMs: number;
  actualSampleMs: number;
  updatedAt: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function readCalibrations(): CodmCalibration[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CODM_CALIBRATION_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getCalibration(ispName: string | null | undefined): CodmCalibration | null {
  if (!ispName) return null;
  return readCalibrations().find((c) => c.ispName === ispName) ?? null;
}

/**
 * A generic cloud region's HTTPS latency is a poor stand-in for real CODM
 * server latency — the game runs on specialized, well-peered gaming
 * infrastructure that a browser can never reach directly (no raw UDP
 * sockets), and the gap between the two varies by ISP/route rather than
 * being a fixed constant. Instead of guessing a global correction factor,
 * this lets a player tell the app what CODM's own HUD actually shows once,
 * and every future reading on that ISP is scaled to match.
 */
export function saveCalibration(ispName: string, rawScanMs: number, actualMs: number): CodmCalibration {
  const ratio = rawScanMs > 0 ? clamp(actualMs / rawScanMs, 0.05, 2) : 1;
  const entry: CodmCalibration = {
    ispName,
    ratio,
    rawSampleMs: rawScanMs,
    actualSampleMs: actualMs,
    updatedAt: Date.now(),
  };

  if (typeof window === "undefined") return entry;
  const next = [...readCalibrations().filter((c) => c.ispName !== ispName), entry];
  try {
    window.localStorage.setItem(CODM_CALIBRATION_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable/full — calibration just won't persist this run
  }
  return entry;
}

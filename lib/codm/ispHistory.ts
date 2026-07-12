const CODM_ISP_HISTORY_KEY = "wnt.codm.isp.history.v1";
const CODM_ISP_HISTORY_MAX = 40;

export interface CodmIspHistoryEntry {
  timestamp: number;
  ispName: string;
  bestCodmPingMs: number;
  bestRegionLabel: string;
  tierLabel: string;
}

export interface CodmIspSummary {
  ispName: string;
  bestCodmPingMs: number;
  bestRegionLabel: string;
  tierLabel: string;
  lastTested: number;
  timesTested: number;
}

export function readIspHistory(): CodmIspHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CODM_ISP_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendIspHistory(entry: CodmIspHistoryEntry): CodmIspHistoryEntry[] {
  if (typeof window === "undefined") return [];
  const current = readIspHistory();
  const next = [...current, entry].slice(-CODM_ISP_HISTORY_MAX);
  try {
    window.localStorage.setItem(CODM_ISP_HISTORY_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable/full — history just won't persist this run
  }
  return next;
}

/**
 * Collapse raw history into one row per ISP the gamer has actually tested
 * from, keeping each ISP's best-ever CODM ping. This is what lets a player
 * answer "which of my SIMs/networks should I play on tonight" by testing
 * across MTN/Orange/Camtel/Starlink over time and coming back to compare —
 * something no single-network snapshot can tell them upfront.
 */
export function summarizeByIsp(history: CodmIspHistoryEntry[]): CodmIspSummary[] {
  const byIsp = new Map<string, CodmIspSummary>();

  for (const entry of history) {
    const existing = byIsp.get(entry.ispName);
    if (!existing) {
      byIsp.set(entry.ispName, {
        ispName: entry.ispName,
        bestCodmPingMs: entry.bestCodmPingMs,
        bestRegionLabel: entry.bestRegionLabel,
        tierLabel: entry.tierLabel,
        lastTested: entry.timestamp,
        timesTested: 1,
      });
      continue;
    }

    existing.timesTested += 1;
    existing.lastTested = Math.max(existing.lastTested, entry.timestamp);
    if (entry.bestCodmPingMs < existing.bestCodmPingMs) {
      existing.bestCodmPingMs = entry.bestCodmPingMs;
      existing.bestRegionLabel = entry.bestRegionLabel;
      existing.tierLabel = entry.tierLabel;
    }
  }

  return [...byIsp.values()].sort((a, b) => a.bestCodmPingMs - b.bestCodmPingMs);
}

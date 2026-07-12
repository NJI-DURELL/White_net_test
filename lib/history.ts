import { HISTORY_MAX_ENTRIES, HISTORY_STORAGE_KEY } from "./constants";
import type { HistoryEntry } from "./types";

export function readHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendHistory(entry: HistoryEntry): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  const current = readHistory();
  const next = [...current, entry].slice(-HISTORY_MAX_ENTRIES);
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable/full — history just won't persist this run
  }
  return next;
}

import { useCallback, useEffect, useState } from "react";
import { appendHistory, readHistory } from "@/lib/history";
import type { HistoryEntry } from "@/lib/types";

export function useLocalHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  const addEntry = useCallback((entry: HistoryEntry) => {
    setHistory(appendHistory(entry));
  }, []);

  return { history, addEntry };
}

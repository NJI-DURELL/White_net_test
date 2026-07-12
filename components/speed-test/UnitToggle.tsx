"use client";

import { clsx } from "clsx";
import type { SpeedUnit } from "@/lib/units";

export function UnitToggle({ unit, onChange }: { unit: SpeedUnit; onChange: (u: SpeedUnit) => void }) {
  return (
    <div className="glass inline-flex rounded-full p-1 text-xs font-medium">
      {(["MBps", "Mbps"] as const).map((u) => (
        <button
          key={u}
          onClick={() => onChange(u)}
          className={clsx(
            "rounded-full px-3 py-1.5 transition-colors",
            unit === u ? "bg-sky-400/20 text-sky-300" : "text-current/50 hover:text-current/80"
          )}
        >
          {u === "MBps" ? "MB/s" : "Mbps"}
        </button>
      ))}
    </div>
  );
}

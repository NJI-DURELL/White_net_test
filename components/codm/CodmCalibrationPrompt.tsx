"use client";

import { useState } from "react";
import { Gauge } from "lucide-react";

export function CodmCalibrationPrompt({
  calibrated,
  onCalibrate,
}: {
  calibrated: boolean;
  onCalibrate: (actualMs: number) => void;
}) {
  const [open, setOpen] = useState(!calibrated);
  const [value, setValue] = useState("");

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-white/40 underline decoration-dotted underline-offset-4 transition-colors hover:text-white/70"
      >
        Recalibrate with your real CODM ping
      </button>
    );
  }

  const submit = () => {
    const ms = Number(value);
    if (Number.isFinite(ms) && ms > 0 && ms < 1000) {
      onCalibrate(ms);
      setOpen(false);
    }
  };

  return (
    <div className="glass flex w-full flex-col gap-2.5 rounded-2xl border border-white/10 p-4">
      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/50">
        <Gauge size={13} /> {calibrated ? "Recalibrate" : "Calibrate for your exact ping"}
      </span>
      <p className="text-xs leading-relaxed text-white/45">
        A browser can&apos;t reach CODM&apos;s real game servers directly — this scan estimates via the nearest
        comparable network route. Open CODM, check the ping in its own HUD, and enter it here once to correct
        every future reading on this ISP.
      </p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={999}
          placeholder="e.g. 40"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="w-24 rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-sm text-white outline-none focus:border-sky-400/50"
        />
        <span className="text-xs text-white/35">ms</span>
        <button
          onClick={submit}
          disabled={!value}
          className="rounded-lg bg-gradient-to-r from-sky-400/25 to-rose-500/25 px-3 py-1.5 text-xs font-semibold text-white transition-opacity disabled:opacity-40"
        >
          Save
        </button>
      </div>
    </div>
  );
}

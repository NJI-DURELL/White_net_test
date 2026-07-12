"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import type { ActivePanel } from "@/lib/types";

export function PanelToggle({
  active,
  onChange,
}: {
  active: ActivePanel;
  onChange: (panel: ActivePanel) => void;
}) {
  return (
    <div className="glass relative flex items-center gap-1 rounded-full p-1">
      <ToggleButton active={active === "speed"} onClick={() => onChange("speed")}>
        <Activity size={14} />
        Speed Test
      </ToggleButton>
      <ToggleButton active={active === "codm"} onClick={() => onChange("codm")}>
        <span className="relative h-4 w-4 overflow-hidden rounded-full">
          <Image src="/og-clan-logo.jpg" alt="" fill className="object-cover" />
        </span>
        CODM Ping
      </ToggleButton>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="relative z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
    >
      {active && (
        <motion.span
          layoutId="panel-toggle-pill"
          className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-sky-400/25 to-rose-500/25"
          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
        />
      )}
      <span className={active ? "flex items-center gap-1.5 text-current" : "flex items-center gap-1.5 text-current/45"}>
        {children}
      </span>
    </button>
  );
}

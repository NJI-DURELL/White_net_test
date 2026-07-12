"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Info } from "lucide-react";

export function Tooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((v) => !v)}
    >
      <Info size={14} className="text-current/50 opacity-60" />
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="glass absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-lg p-2.5 text-xs leading-relaxed text-current/80 shadow-2xl"
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

export function TooltipWrap({ text, children }: { text: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {children}
      <Tooltip text={text} />
    </span>
  );
}

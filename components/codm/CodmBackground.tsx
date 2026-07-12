"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/**
 * Immersive CODM-styled backdrop: black base with the OG Clan shield's
 * signature blue/red duotone glow, a faint tactical grid, and a large,
 * low-opacity logo watermark. Deliberately darker/higher-contrast than the
 * main speed-test background so the second panel reads as its own space.
 */
export function CodmBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black">
      <div className="absolute inset-0 opacity-[0.07]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(56,189,248,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <motion.div
        className="absolute -left-1/4 top-[-15%] h-[65vmax] w-[65vmax] rounded-full bg-sky-500/20 blur-[120px]"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-1/4 bottom-[-15%] h-[65vmax] w-[65vmax] rounded-full bg-rose-600/20 blur-[120px]"
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <div className="absolute left-1/2 top-1/2 h-[50vmin] w-[50vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/5 blur-[100px]" />

      <div className="absolute left-1/2 top-1/2 aspect-square w-[70vmin] max-w-3xl -translate-x-1/2 -translate-y-1/2 opacity-[0.06]">
        <Image src="/og-clan-logo.jpg" alt="" fill className="rounded-full object-cover" priority={false} />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.75)_100%)]" />
    </div>
  );
}

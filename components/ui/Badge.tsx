import { clsx } from "clsx";
import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  const toneClasses: Record<string, string> = {
    neutral: "bg-sky-400/10 text-sky-300 border-sky-400/20",
    good: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
    warn: "bg-amber-400/10 text-amber-300 border-amber-400/20",
    bad: "bg-rose-400/10 text-rose-300 border-rose-400/20",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        toneClasses[tone]
      )}
    >
      {children}
    </span>
  );
}

import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

export function Button({
  className,
  variant = "primary",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-sky-400/15 text-sky-300 border border-sky-400/25 hover:bg-sky-400/25",
        variant === "ghost" &&
          "bg-transparent text-current border border-white/10 hover:bg-white/5",
        className
      )}
      {...rest}
    />
  );
}

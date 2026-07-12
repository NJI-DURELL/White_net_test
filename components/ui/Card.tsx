import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("glass rounded-2xl p-5 shadow-xl shadow-black/5", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

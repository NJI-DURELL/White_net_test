"use client";

import { motion, useTransform } from "framer-motion";
import { useAnimatedValue } from "@/hooks/useAnimatedValue";

export function AnimatedNumber({
  value,
  decimals = 1,
  className,
}: {
  value: number;
  decimals?: number;
  className?: string;
}) {
  const smoothed = useAnimatedValue(value);
  const display = useTransform(smoothed, (v) => v.toFixed(decimals));

  return <motion.span className={className}>{display}</motion.span>;
}
